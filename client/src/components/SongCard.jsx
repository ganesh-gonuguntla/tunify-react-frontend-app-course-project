import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { usePlayer } from '../state/PlayerContext'
import { api } from '../utils/api'
import AddToPlaylistModal from './AddToPlaylistModal'
import "../styles/modal.css"   // ← ADD THIS

import { motion } from 'framer-motion'

export default function SongCard({ song, onAddedToPlaylist, onLiked, contextQueue, index }) {
  const { user, updateUser } = useAuth()
  const { current, isPlaying, playSongs, pause, play } = usePlayer()
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [playlists, setPlaylists] = useState([])

  const playingThis = current?.id === song.id && isPlaying
  const isLiked = Boolean((user?.likedSongIds || []).map(String).includes(String(song.id)))

  const togglePlay = () => {
    if (current?.id !== song.id) {
      if (contextQueue && typeof index === 'number') {
        playSongs(contextQueue, index)
      } else {
        playSongs([song], 0)
      }
    } else {
      playingThis ? pause() : play()
    }
  }

  const like = async () => {
    if (!user) return
    await ensureSongInDb()
    const liked = Array.from(new Set([...(user.likedSongIds || []), song.id]))
    const { data } = await api.patch(`/users/${user.id}`, { likedSongIds: liked })
    updateUser(data)
    onLiked && onLiked(song.id)
  }

  const unlike = async () => {
    if (!user) return
    const next = (user.likedSongIds || []).filter((id) => String(id) !== String(song.id))
    const { data } = await api.patch(`/users/${user.id}`, { likedSongIds: next })
    updateUser(data)
    onLiked && onLiked(song.id)
  }

  const ensureSongInDb = async () => {
    try {
      const { data } = await api.get(`/songs?id=${song.id}`)
      if (!Array.isArray(data) || data.length === 0) {
        await api.post('/songs', song)
      }
    } catch { }
  }

  const addToPlaylist = async () => {
    if (!user) return
    await ensureSongInDb()
    const { data: existing } = await api.get(`/playlists?userId=${user.id}`)
    setPlaylists(existing)
    setShowPlaylistModal(true)
  }

  return (
    <motion.div
      className="songcard-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <img src={song.coverUrl} alt="cover" className="songcard-cover" />

      <div className="songcard-info">
        <div className="songcard-title">{song.title}</div>
        <div className="songcard-artist">{song.artist}</div>
      </div>

      <div className="songcard-actions">
        <motion.button
          onClick={togglePlay}
          className="songcard-playbtn"
          title={playingThis ? 'Pause' : 'Play'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {playingThis ? '⏸' : '▶'}
        </motion.button>

        <motion.button
          onClick={isLiked ? unlike : like}
          className="songcard-iconbtn"
          title={isLiked ? 'Unlike' : 'Like'}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
        >
          {isLiked ? '❤️' : '🤍'}
        </motion.button>

        <motion.button
          onClick={addToPlaylist}
          className="songcard-iconbtn"
          id="add-playlist"
          title="Add to playlist"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
        >
          ➕
        </motion.button>
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal
          song={song}
          user={user}
          playlists={playlists}
          onClose={() => setShowPlaylistModal(false)}
          onAdded={() => {
            onAddedToPlaylist && onAddedToPlaylist()
          }}
        />
      )}
    </motion.div>
  )
}


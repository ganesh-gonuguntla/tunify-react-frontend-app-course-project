import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { usePlayer } from '../state/PlayerContext'
import { api } from '../utils/api'
import AddToPlaylistModal from './AddToPlaylistModal'
// import "../styles/modal.css"   // ← ADD THIS

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
      className="flex items-center gap-[12px] w-full p-[12-x] shadow-[7px_7px_5px_#888888] rounded-[8px] cursor-pointer bg-gradient-to-br from-[#000001] via-[#2d004d] to-[#6a0dad]
 hover:bg-[#2d004d] hover:border hover:border-[snow]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.007 }}
      onClick={togglePlay}
      title={playingThis ? 'Pause' : 'Play'}
     
    >
      <img src={song.coverUrl} alt="cover" className="ml-[10px] w-[64px] h-[60px] py-[3px] rounded-[8px] object-cover" />

      <div className="flex-1">
        <div className="font-semibold text-white">{song.title}</div>
        <div className="text-sm text-[#9ca3af]">{song.artist}</div>
      </div>

      <div className="flex items-center gap-[20px]">
        {/* <motion.button
          onClick={togglePlay}
          className="songcard-playbtn"
          
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {playingThis ? '⏸' : '▶'}
        </motion.button> */}

        <motion.button
          onClick={isLiked ? unlike : like}
          className="text-white text-lg cursor-pointer bg-white rounded-[10%] p-0 border-[3px] border-white hover:opacity-75"
          title={isLiked ? 'Unlike' : 'Like'}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
        >
          {isLiked ? '❤️' : '🤍'}
        </motion.button>

        <motion.button
          onClick={addToPlaylist}
          className="text-white mr-[10px] text-lg cursor-pointer bg-white rounded-[10%] p-0 border-[3px] border-white hover:opacity-75"
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


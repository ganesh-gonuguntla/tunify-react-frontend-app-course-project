import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { usePlayer } from '../state/PlayerContext'
import { api } from '../utils/api'
import AddToPlaylistModal from './AddToPlaylistModal'

export default function SongCard({ song, onAddedToPlaylist, onLiked }) {
  const { user, updateUser } = useAuth()
  const { current, isPlaying, playSongs, pause, play } = usePlayer()
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [playlists, setPlaylists] = useState([])

  const playingThis = current?.id === song.id && isPlaying
  const isLiked = Boolean(user?.likedSongIds?.includes(song.id))

  const togglePlay = () => {
    if (current?.id !== song.id) {
      playSongs([song], 0)
    } else {
      playingThis ? pause() : play()
    }
  }

  const like = async () => {
    if (!user) return
    // Ensure the song exists in the app DB (important for songs fetched from internet)
    await ensureSongInDb()
    const liked = Array.from(new Set([...(user.likedSongIds || []), song.id]))
    const { data } = await api.patch(`/users/${user.id}`, { likedSongIds: liked })
    updateUser(data)
    onLiked && onLiked(song.id)
  }

  const unlike = async () => {
    if (!user) return
    const next = (user.likedSongIds || []).filter((id) => id !== song.id)
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
    } catch {}
  }

  const addToPlaylist = async () => {
    if (!user) return
    await ensureSongInDb()
    const { data: existing } = await api.get(`/playlists?userId=${user.id}`)
    setPlaylists(existing)
    setShowPlaylistModal(true)
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded border border-gray-200">
      <img src={song.coverUrl} alt="cover" className="w-16 h-16 rounded object-cover" />
      <div className="flex-1">
        <div className="font-medium">{song.title}</div>
        <div className="text-sm text-gray-500">{song.artist}</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={togglePlay} className="px-2 py-1 rounded bg-gray-900 text-white" title={playingThis ? 'Pause' : 'Play'}>
          {playingThis ? '⏸' : '▶'}
        </button>
        <button
          onClick={isLiked ? unlike : like}
          className="btn btn-action"
          style={{ fontSize: '16px', background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer' }}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        <button onClick={addToPlaylist} className="btn btn-action" style={{ fontSize: '16px', background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer' }} title="Add to playlist">➕</button>
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
    </div>
  )
}



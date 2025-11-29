import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { api } from '../utils/api'
import SongCard from '../components/SongCard'
import PlaylistCard from '../components/PlaylistCard'
import PlaylistModal from '../components/PlaylistModal'
import { usePlayer } from '../state/PlayerContext'
import { motion } from 'framer-motion'
import '../styles/profilePage.css'   

export default function ProfilePage() {

  const { user, updateUser } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [songs, setSongs] = useState([])
  const [history, setHistory] = useState([])
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const { playSongs, setShuffle, shuffle } = usePlayer()

  useEffect(() => {
    if (!user) return

    api.get(`/playlists?userId=${user.id}`).then((res) => setPlaylists(res.data))
    api.get('/songs').then((res) => setSongs(res.data))

    setHistory(user.history || [])
  }, [user])
  const likedSongs = useMemo(() => {
    return songs.filter((s) => (user?.likedSongIds || []).map(String).includes(String(s.id)))
  }, [songs, user])
  const refreshPlaylists = async () => {
    if (!user) return
    const res = await api.get(`/playlists?userId=${user.id}`)
    setPlaylists(res.data)
  }
  const createPlaylist = async () => {
    if (!user) return

    const name = window.prompt('New playlist name')
    if (!name) return

    await api.post('/playlists', {
      userId: user.id,
      name,
      songIds: []
    })

    refreshPlaylists()
  }
  const renamePlaylist = async (pl) => {
    const name = window.prompt('Rename playlist', pl.name)
    if (!name) return

    await api.patch(`/playlists/${pl.id}`, { ...pl, name })
    refreshPlaylists()
  }
  const deletePlaylist = async (pl) => {
    if (!window.confirm('Delete this playlist?')) return
    await api.delete(`/playlists/${pl.id}`)
    refreshPlaylists()
  }
  const removeSongFromPlaylist = async (pl, songId) => {
    const updated = {
      ...pl,
      songIds: (pl.songIds || []).filter((id) => String(id) !== String(songId))
    }
    await api.patch(`/playlists/${pl.id}`, updated)
    refreshPlaylists()
  }
  const playHistorySong = (index) => {
    const historySongs = history.map(h => songs.find(s => String(s.id) === String(h.songId))).filter(Boolean)

    const clickedHistoryItem = history[index]
    const songIndex = historySongs.findIndex(s => String(s.id) === String(clickedHistoryItem.songId))

    if (songIndex !== -1) {
      setShuffle(false)
      playSongs(historySongs, songIndex)
    }
  }

  return (
    <motion.main
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="profile-title" style={{ marginBottom: '20px' }}>Hey, {user?.username} welcome to your section</h2>

      <section className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-title">Liked Songs</h2>
          <Link to="/liked" className="primary-btn profile-button">View liked songs</Link>
        </div>
      </section>
      <section className="profile-section">

        <div className="profile-section-header">
          <h2 className="profile-title">Playlists</h2>

          <button className="primary-btn profile-button" onClick={createPlaylist}>
            New Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="profile-empty">No playlists yet.</div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onClick={() => setSelectedPlaylist(pl)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="profile-title mb-4">Listening History</h2>
          <div>
            {history.length > 0 && (
              <button
                className=" clear-all mb-4"
                onClick={async () => {
                  if (!user) return
                  if (!window.confirm('Clear all listening history?')) return
                  const { data } = await api.patch(`/users/${user.id}`, { history: [] })
                  updateUser(data)
                  setHistory([])
                }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="profile-empty">No history yet.</div>
        ) : (
          <ul className="history-list">
            {history.map((h, idx) => (
              <li
                key={idx}
                className="history-item"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                onClick={() => playHistorySong(idx)}
              >
                <div style={{ flex: 1 }}>
                  {h.title} — {h.artist}
                </div>
                <button
                  className="cross"
                  onClick={async (e) => {
                    e.stopPropagation() 
                    if (!user) return
                    const nextHistory = (user.history || []).filter((it) => {
                      if (it.id && h.id) return String(it.id) !== String(h.id)
                      return !(it.title === h.title && it.artist === h.artist)
                    })
                    const { data } = await api.patch(`/users/${user.id}`, { history: nextHistory })
                    updateUser(data)
                    setHistory(data.history || [])
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedPlaylist && (
        <PlaylistModal
          playlist={selectedPlaylist}
          songs={songs}
          user={user}
          onClose={() => setSelectedPlaylist(null)}
          onPlaylistUpdated={(updated) => {
            if (updated === null) {
              refreshPlaylists()
              setSelectedPlaylist(null)
            } else {
              setPlaylists(playlists.map((p) => (p.id === updated.id ? updated : p)))
            }
          }}
        />
      )}
    </motion.main>
  )
}

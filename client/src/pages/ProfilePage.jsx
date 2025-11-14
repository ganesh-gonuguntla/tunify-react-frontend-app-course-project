import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { api } from '../utils/api'
import SongCard from '../components/SongCard'
import PlaylistCard from '../components/PlaylistCard'
import PlaylistModal from '../components/PlaylistModal'
import { usePlayer } from '../state/PlayerContext'
import '../styles/profilePage.css'   // <-- Profile page styles

export default function ProfilePage() {

  /* -----------------------------------------
   *  GLOBAL STATE & USER CONTEXT
   * -----------------------------------------
   * user       → Currently logged-in user object
   * playlists  → List of user playlists
   * songs      → All songs in db.json
   * history    → Songs listened by user (from user.history)
   */
  const { user, updateUser } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [songs, setSongs] = useState([])
  const [history, setHistory] = useState([])
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  // Music player context (used to play playlists)
  const { playSongs, setShuffle, shuffle } = usePlayer()

  /* -----------------------------------------
   *  LOAD USER PLAYLISTS + ALL SONGS
   * -----------------------------------------
   * Runs every time the user changes (e.g., login)
   * Pulls playlists for the specific userId
   * Loads all available songs into state
   * Loads history stored in the user's record
   */
  useEffect(() => {
    if (!user) return

    api.get(`/playlists?userId=${user.id}`).then((res) => setPlaylists(res.data))
    api.get('/songs').then((res) => setSongs(res.data))

    // Load listening history stored in the user object
    setHistory(user.history || [])
  }, [user])

  /* -----------------------------------------
   *  LIKED SONGS (computed from user.likedSongIds)
   * ----------------------------------------- */
  const likedSongs = useMemo(() => {
    return songs.filter((s) => (user?.likedSongIds || []).includes(s.id))
  }, [songs, user])

  /* -----------------------------------------
   *  REFRESH PLAYLIST DATA FROM SERVER
   * ----------------------------------------- */
  const refreshPlaylists = async () => {
    if (!user) return
    const res = await api.get(`/playlists?userId=${user.id}`)
    setPlaylists(res.data)
  }

  /* -----------------------------------------
   *  CREATE NEW PLAYLIST
   * ----------------------------------------- */
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

  /* -----------------------------------------
   *  RENAME EXISTING PLAYLIST
   * ----------------------------------------- */
  const renamePlaylist = async (pl) => {
    const name = window.prompt('Rename playlist', pl.name)
    if (!name) return

    await api.patch(`/playlists/${pl.id}`, { ...pl, name })
    refreshPlaylists()
  }

  /* -----------------------------------------
   *  DELETE PLAYLIST
   * ----------------------------------------- */
  const deletePlaylist = async (pl) => {
    if (!window.confirm('Delete this playlist?')) return
    await api.delete(`/playlists/${pl.id}`)
    refreshPlaylists()
  }

  /* -----------------------------------------
   *  REMOVE SONG FROM PLAYLIST
   * ----------------------------------------- */
  const removeSongFromPlaylist = async (pl, songId) => {
    const updated = {
      ...pl,
      songIds: (pl.songIds || []).filter((id) => id !== songId)
    }
    await api.patch(`/playlists/${pl.id}`, updated)
    refreshPlaylists()
  }

  /* -----------------------------------------
   *  MAIN PAGE UI
   * ----------------------------------------- */
  return (
    <main className="profile-page">

      {/* ======== LIKED SONGS SECTION ======== */}
      <section className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-title">Liked Songs ❤️</h2>
          <Link to="/liked" className="primary-btn profile-button">View liked songs</Link>
        </div>
      </section>

      {/* ======== PLAYLIST SECTION ======== */}
      <section className="profile-section">

        {/* Header row: Playlist title + "New Playlist" button */}
        <div className="profile-section-header">
          <h2 className="profile-title">Playlists ▶️</h2>

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

      {/* ======== LISTENING HISTORY ======== */}
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
                  <li key={idx} className="history-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      {h.title} — {h.artist}
                    </div>
                      <button
                        className="cross"
                        onClick={async () => {
                          if (!user) return
                          // Build next history by removing matching item (by id if present, otherwise by title+artist)
                          const nextHistory = (user.history || []).filter((it) => {
                            if (it.id && h.id) return it.id !== h.id
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
              // Playlist was deleted
              refreshPlaylists()
              setSelectedPlaylist(null)
            } else {
              // Playlist was updated
              setPlaylists(playlists.map((p) => (p.id === updated.id ? updated : p)))
            }
          }}
        />
      )}
    </main>
  )
}

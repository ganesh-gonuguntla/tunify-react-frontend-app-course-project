import { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { api } from '../utils/api'
import SongCard from '../components/SongCard'
import { usePlayer } from '../state/PlayerContext'
import '../styles/modal.css'
import '../styles/modal.css'   // ← Add this new CSS file

export default function LikedSongsPage() {
  const { user } = useAuth()
  const [songs, setSongs] = useState([])
  const { playSongs, setShuffle, shuffle } = usePlayer()

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const res = await api.get('/songs')
      setSongs(res.data)
    }
    load()
  }, [user])

  const likedSongs = songs.filter((s) =>
    (user?.likedSongIds || []).includes(s.id)
  )

  if (!user) return null

  return (
    <main className="liked-container">
      <div className="liked-header">
        <h1 className="liked-title">Liked Songs</h1>
        <div className="liked-count">
          {likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {likedSongs.length === 0 ? (
        <div className="liked-empty">You don't have any liked songs yet.</div>
      ) : (
        <div className="liked-list">
          {likedSongs.map((s) => (
            <SongCard key={s.id} song={s} />
          ))}
        </div>
      )}
    </main>
  )
}

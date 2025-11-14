import { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { api } from '../utils/api'
import SongCard from '../components/SongCard'
import { usePlayer } from '../state/PlayerContext'

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

  const likedSongs = songs.filter((s) => (user?.likedSongIds || []).includes(s.id))

  if (!user) return null

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="mt-3 home-title">Liked Songs</h1>
        <div className="text-sm text-gray-500 ">{likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}</div>
      </div>

      {likedSongs.length === 0 ? (
        <div className="text-gray-500">You don't have any liked songs yet.</div>
      ) : (
        <div className="space-y-3">
          {likedSongs.map((s) => (
            <SongCard key={s.id} song={s} />
          ))}
        </div>
      )}
    </main>
  )
}

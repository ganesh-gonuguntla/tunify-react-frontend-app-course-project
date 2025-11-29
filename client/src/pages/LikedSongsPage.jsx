import { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { api } from '../utils/api'
import SongCard from '../components/SongCard'
import { usePlayer } from '../state/PlayerContext'
import { motion } from 'framer-motion'


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
    <motion.main
      className="min-w-full min-h-[150vh] mx-auto p-[24px] bg-[#f8d2deff]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-[18px]">
        <h1 className="mt-[12px] text-[40px] text-[40px] font-[Raleway,sans-serif] mb-[10px] ml-0">Liked Songs</h1>
        <div className="text-[20px] font-bold">
          {likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}
        </div> 
      </div>

      {likedSongs.length === 0 ? (
        <div className="text-[#9ca3af] text-[15px]">You don't have any liked songs yet.</div>
      ) : (
        <div className="flex flex-col gap-[12px] min-h-[100px]">
          {likedSongs.map((s, index) => (
            <SongCard key={s.id} song={s} contextQueue={likedSongs} index={index} />
          ))}
        </div>
      )}
    </motion.main>
  )
}

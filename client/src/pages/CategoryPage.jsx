import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { fetchSongsByCategoryFromInternet } from '../utils/musicApi'
import SongCard from '../components/SongCard'
import { usePlayer } from '../state/PlayerContext'
import { motion } from 'framer-motion'

export default function CategoryPage() {
  const { slug } = useParams()
  const [songs, setSongs] = useState([])
  const { playSongs, setShuffle, shuffle } = usePlayer()
  const [useInternet, setUseInternet] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (useInternet) {
        try {
          const online = await fetchSongsByCategoryFromInternet(slug)
          setSongs(online)
          return
        } catch { }
      }
      const res = await api.get(`/songs?category=${slug}`)
      setSongs(res.data)
    }
    load()
  }, [slug, useInternet])

  const startShuffle = () => {
    const newShuffleState = !shuffle
    setShuffle(newShuffleState)

    // Create shuffled array if enabling shuffle
    if (newShuffleState) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5)
      playSongs(shuffled, 0)
    } else {
      playSongs(songs, 0)
    }
  }

  const playAll = () => {
    setShuffle(false)
    playSongs(songs, 0)
  }

  const playAllShuffled = () => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5)
    setSongs(shuffled) // Update UI to show shuffled order
    setShuffle(true)
    playSongs(shuffled, 0)
  }

  return (
    <motion.main
      className="max-w-full mx-auto py-[24px] px-[16px] bg-[linear-gradient(135deg,#b3fefd,#faa5c1)] min-h-[90vh] "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-[18px]">
        <h1 className="text-[40px] font-extrabold font-[Raleway] capitalize mb-[10px] bg-[linear-gradient(135deg,#000000,#2d004d,#6a0dad)] bg-clip-text text-transparent ml-0">{slug}</h1>

        <div className="flex gap-[10px]">
          <button
            onClick={() => setUseInternet(v => !v)}
            className="px-[14px] py-[6px] border border-[#ccc] bg-white rounded-[6px] text-[14px] cursor-pointer transition duration-200 hover:bg-[#f2f2f2]"
          >
            {useInternet ? 'Using Internet' : 'Use Internet'}
          </button>

          <button
            onClick={playAll}
            className="px-[14px] py-[6px] border border-[#ccc] bg-white rounded-[6px] text-[14px] cursor-pointer transition duration-200 hover:bg-[#f2f2f2]"
          >
            ▶ Play All
          </button>

          <button
            onClick={playAllShuffled}
            className="px-[14px] py-[6px] border border-[#ccc] bg-white rounded-[6px] text-[14px] cursor-pointer transition duration-200 hover:bg-[#f2f2f2]"
          >
            🔀 Shuffle All
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[13px] items-center">
        {songs.map((song, index) => (
          <SongCard key={song.id} song={song} contextQueue={songs} index={index} />
        ))}
      </div>
    </motion.main>
  )
}

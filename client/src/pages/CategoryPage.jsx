import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { fetchSongsByCategoryFromInternet } from '../utils/musicApi'
import SongCard from '../components/SongCard'
import { usePlayer } from '../state/PlayerContext'
import { motion } from 'framer-motion'
import '../styles/navbar.css'   // <-- NEW CSS FILE

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
      className="category-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="category-header">
        <h1 className="category-title">{slug}</h1>

        <div className="category-buttons">
          <button
            onClick={() => setUseInternet(v => !v)}
            className="category-button"
          >
            {useInternet ? 'Using Internet' : 'Use Internet'}
          </button>

          <button
            onClick={playAll}
            className="category-button"
          >
            ▶ Play All
          </button>

          <button
            onClick={playAllShuffled}
            className="category-button"
          >
            🔀 Shuffle All
          </button>
        </div>
      </div>

      <div className="category-songs">
        {songs.map((song, index) => (
          <SongCard key={song.id} song={song} contextQueue={songs} index={index} />
        ))}
      </div>
    </motion.main>
  )
}

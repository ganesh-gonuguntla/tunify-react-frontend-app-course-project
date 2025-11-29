import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { fetchSongsByCategoryFromInternet } from '../utils/musicApi'
import SongCard from '../components/SongCard'
import { usePlayer } from '../state/PlayerContext'
import { motion } from 'framer-motion'

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(false)
  const [useInternet, setUseInternet] = useState(true)
  const { playSongs, setShuffle, shuffle } = usePlayer()

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSongs([])
      return
    }

    const searchSongs = async () => {
      setLoading(true)
      try {
        if (useInternet) {
          // Search iTunes API
          const results = await fetchSongsByCategoryFromInternet(searchQuery, 50)
          // Filter results based on search query
          const filtered = results.filter(
            (song) =>
              song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              song.artist.toLowerCase().includes(searchQuery.toLowerCase())
          )
          setSongs(filtered)
        } else {
          // Search local database
          const { data } = await api.get('/songs')
          const filtered = data.filter(
            (song) =>
              song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          setSongs(filtered)
        }
      } catch (error) {
        console.error('Search error:', error)
        setSongs([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchSongs, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, useInternet])

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
      className="max-w-full mx-auto py-[24px] px-[16px] bg-[linear-gradient(100deg,#ffc0d4ff,#b0fffeff)] min-h-[90vh] "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-[18px]">
        <h1 className="text-[40px] font-extrabold font-[Raleway] capitalize mb-[10px] bg-[linear-gradient(135deg,#000000,#2d004d,#6a0dad)] bg-clip-text text-transparent ml-0">Browse & Search</h1>

        <div className="flex gap-[10px]">
          <button
            onClick={() => setUseInternet((v) => !v)}
            className="px-[14px] py-[6px] border border-[#ccc] bg-white rounded-[6px] text-[14px] cursor-pointer transition duration-200 hover:bg-[#f2f2f2]"
          >
            {useInternet ? 'Using Internet' : 'Use Internet'}
          </button>

          {songs.length > 0 && (
            <>
              <button onClick={playAll} className="px-[14px] py-[6px] border border-[#ccc] bg-white rounded-[6px] text-[14px] cursor-pointer transition duration-200 hover:bg-[#f2f2f2]">
                ▶ Play All
              </button>

              <button onClick={playAllShuffled} className="px-[14px] py-[6px] border border-[#ccc] bg-white rounded-[6px] text-[14px] cursor-pointer transition duration-200 hover:bg-[#f2f2f2]">
                🔀 Shuffle All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="search-container" style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search songs by title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '12px 16px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            outline: 'none',
          }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Searching...
        </div>
      )}

      {!loading && searchQuery.trim() && songs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No songs found matching "{searchQuery}"
        </div>
      )}

      {!loading && !searchQuery.trim() && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Enter a search term to find songs
        </div>
      )}

      <div className="flex flex-col gap-[13px] items-center">
        {songs.map((song, index) => (
          <SongCard key={song.id} song={song} contextQueue={songs} index={index} />
        ))}
      </div>
    </motion.main>
  )
}
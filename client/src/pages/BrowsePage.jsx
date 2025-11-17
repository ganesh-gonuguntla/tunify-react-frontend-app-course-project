import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { fetchSongsByCategoryFromInternet } from '../utils/musicApi'
import SongCard from '../components/SongCard'
import { usePlayer } from '../state/PlayerContext'
import '../styles/navbar.css'

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
    <main className="category-page">
      <div className="category-header">
        <h1 className="category-title">Browse & Search</h1>

        <div className="category-buttons">
          <button
            onClick={() => setUseInternet((v) => !v)}
            className="category-button"
          >
            {useInternet ? 'Using Internet' : 'Use Internet'}
          </button>

          {songs.length > 0 && (
            <>
              <button onClick={playAll} className="category-button">
                ▶ Play All
              </button>

              <button onClick={playAllShuffled} className="category-button">
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

      <div className="category-songs">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </main>
  )
}


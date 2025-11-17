import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../utils/api'

const PlayerContext = createContext({})

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio())
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [shouldPlay, setShouldPlay] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [loop, setLoop] = useState(false)
  const prevSongRef = useRef(null)
  const { user, updateUser } = useAuth()

  const current = currentIndex >= 0 ? queue[currentIndex] : null

  const playSongs = (songs, startIndex = 0) => {
    if (!songs || songs.length === 0) return
    
    const newSong = songs[startIndex]
    if (!newSong) return
    
    // Stop current audio before switching
    const audio = audioRef.current
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
    
    // Update state
    setQueue(songs)
    setCurrentIndex(startIndex)
    setIsPlaying(false)
    
    // Immediately play the new song (don't wait for state update)
    audio.src = newSong.audioUrl
    audio.load()
    
    audio.play()
      .then(() => {
        setIsPlaying(true)
        // log history
        if (user) {
          const entry = { songId: newSong.id, title: newSong.title, artist: newSong.artist, ts: Date.now() }
          const history = Array.isArray(user.history) ? [...user.history, entry] : [entry]
          api
            .patch(`/users/${user.id}`, { history })
            .then((res) => updateUser(res.data))
            .catch(() => {})
        }
      })
      .catch((err) => {
        console.error('Error playing audio:', err)
        setIsPlaying(false)
      })
  }

  const play = () => {
    if (!current) return
    const audio = audioRef.current
    
    // If already playing the same song, just resume
    if (audio.src === current.audioUrl && !isPlaying) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Error resuming audio:', err)
          setIsPlaying(false)
        })
      return
    }
    
    // Otherwise, it's a new song - use shouldPlay flag to trigger useEffect
    setShouldPlay(true)
  }

  // Watch for current song changes and handle playback
  useEffect(() => {
    if (!current) {
      prevSongRef.current = null
      return
    }

    const audio = audioRef.current
    const songChanged = prevSongRef.current && prevSongRef.current.id !== current.id

    // If song changed, stop previous
    if (songChanged) {
      audio.pause()
      audio.currentTime = 0
      audio.src = ''
    }

    // If we should play (new song or manual play), play it
    if (shouldPlay) {
      audio.pause()
      audio.currentTime = 0
      audio.src = current.audioUrl
      audio.load()
      
      audio.play()
        .then(() => {
          setIsPlaying(true)
          setShouldPlay(false)
          // log history
          if (user) {
            const entry = { songId: current.id, title: current.title, artist: current.artist, ts: Date.now() }
            const history = Array.isArray(user.history) ? [...user.history, entry] : [entry]
            api
              .patch(`/users/${user.id}`, { history })
              .then((res) => updateUser(res.data))
              .catch(() => {})
          }
        })
        .catch((err) => {
          console.error('Error playing audio:', err)
          setIsPlaying(false)
          setShouldPlay(false)
        })
    }

    prevSongRef.current = current
  }, [current, shouldPlay, user])

  const pause = () => {
    audioRef.current.pause()
    setIsPlaying(false)
  }

  const next = () => {
    if (queue.length === 0) return
    if (shuffle) {
      const rand = Math.floor(Math.random() * queue.length)
      setCurrentIndex(rand)
    } else {
      setCurrentIndex((i) => (i + 1) % queue.length)
    }
    setShouldPlay(true)
  }

  const prev = () => {
    if (queue.length === 0) return
    setCurrentIndex((i) => (i - 1 + queue.length) % queue.length)
    setShouldPlay(true)
  }

  // Handle user logout - reset player
  useEffect(() => {
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    audioRef.current.src = ''
    setQueue([])
    setCurrentIndex(-1)
    setIsPlaying(false)
    setShouldPlay(false)
  }, [user?.id])

  // Handle audio time updates and metadata
  useEffect(() => {
    const audio = audioRef.current
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      
      // If loop is enabled, audio.loop will handle restart automatically
      // Only proceed to next song if loop is disabled
      if (!loop) {
        // Auto-play next song if available
        if (queue.length > 0 && currentIndex < queue.length - 1) {
          if (shuffle) {
            const rand = Math.floor(Math.random() * queue.length)
            setCurrentIndex(rand)
          } else {
            setCurrentIndex((i) => (i + 1) % queue.length)
          }
          setShouldPlay(true)
        }
      }
    }

    const handleError = () => {
      setIsPlaying(false)
      setShouldPlay(false)
      console.error('Audio playback error')
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [queue, currentIndex, shuffle, loop, current])

  // Handle volume changes
  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  // Handle loop changes
  useEffect(() => {
    const audio = audioRef.current
    audio.loop = loop
    // If loop is enabled and song is playing, ensure it stays playing when it restarts
    if (loop && isPlaying && current) {
      const handleLoopRestart = () => {
        setIsPlaying(true)
      }
      audio.addEventListener('play', handleLoopRestart)
      return () => audio.removeEventListener('play', handleLoopRestart)
    }
  }, [loop, isPlaying, current])

  const seek = (time) => {
    const audio = audioRef.current
    if (audio && !isNaN(audio.duration)) {
      audio.currentTime = time
      setCurrentTime(time)
    }
  }

  const setVolumeLevel = (vol) => {
    const newVolume = Math.max(0, Math.min(1, vol))
    setVolume(newVolume)
  }

  const value = useMemo(
    () => ({
      current,
      isPlaying,
      play,
      pause,
      next,
      prev,
      playSongs,
      queue,
      setShuffle,
      shuffle,
      currentTime,
      duration,
      seek,
      volume,
      setVolume: setVolumeLevel,
      loop,
      setLoop,
    }),
    [current, isPlaying, queue, shuffle, currentTime, duration, volume, loop]
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = () => useContext(PlayerContext)



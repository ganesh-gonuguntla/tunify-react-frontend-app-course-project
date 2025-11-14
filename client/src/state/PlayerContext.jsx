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
  const { user, updateUser } = useAuth()

  const current = currentIndex >= 0 ? queue[currentIndex] : null

  const playSongs = (songs, startIndex = 0) => {
    setQueue(songs)
    setCurrentIndex(startIndex)
    setTimeout(() => play(), 0)
  }

  const play = () => {
    if (!current) return
    const audio = audioRef.current
    audio.src = current.audioUrl
    audio.play()
    setIsPlaying(true)
    // log history
    if (user) {
      const entry = { songId: current.id, title: current.title, artist: current.artist, ts: Date.now() }
      const history = Array.isArray(user.history) ? [...user.history, entry] : [entry]
      api
        .patch(`/users/${user.id}`, { history })
        .then((res) => updateUser(res.data))
        .catch(() => {})
    }
  }

  useEffect(() => {
    audioRef.current.pause()
    setQueue([])
    setCurrentIndex(-1)
    setIsPlaying(false)
  }, [user?.id])

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
    setTimeout(() => play(), 0)
  }

  const prev = () => {
    if (queue.length === 0) return
    setCurrentIndex((i) => (i - 1 + queue.length) % queue.length)
    setTimeout(() => play(), 0)
  }

  const value = useMemo(
    () => ({ current, isPlaying, play, pause, next, prev, playSongs, queue, setShuffle, shuffle }),
    [current, isPlaying, queue, shuffle]
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = () => useContext(PlayerContext)



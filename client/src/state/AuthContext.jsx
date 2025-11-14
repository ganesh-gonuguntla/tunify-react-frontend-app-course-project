import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  updateUser: () => {},
  refreshUser: async () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tunify_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('tunify_user', JSON.stringify(user))
    else localStorage.removeItem('tunify_user')
  }, [user])

  const ensureUserRecord = async (username) => {
    const res = await api.get(`/users?username=${encodeURIComponent(username)}`)
    if (res.data.length) {
      return res.data[0]
    }
    const created = await api.post('/users', { username, likedSongIds: [], playlists: [], history: [] })
    return created.data
  }

  const login = async (username, password) => {
    const { data: matches } = await api.get(`/authUsers?username=${encodeURIComponent(username)}`)
    if (!matches.length) {
      throw new Error('User not found')
    }
    const authUser = matches[0]
    if (authUser.password !== password) {
      throw new Error('Incorrect password')
    }
    const appUser = await ensureUserRecord(username)
    setUser(appUser)
    return appUser
  }

  const register = async (username, password) => {
    const { data: matches } = await api.get(`/authUsers?username=${encodeURIComponent(username)}`)
    if (matches.length) {
      throw new Error('User already exists')
    }
    await api.post('/authUsers', { username, password })
    await ensureUserRecord(username)
    return true
  }

  const refreshUser = async () => {
    if (!user) return null
    const res = await api.get(`/users/${user.id}`)
    setUser(res.data)
    return res.data
  }

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout: () => setUser(null),
      updateUser: (next) => setUser(next),
      refreshUser,
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)



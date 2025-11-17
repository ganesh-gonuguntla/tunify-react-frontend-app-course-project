import './style.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import LikedSongsPage from './pages/LikedSongsPage'
import BrowsePage from './pages/BrowsePage'
import Navbar from './components/Navbar'
import PlayerModal from './components/PlayerModal'
import { AuthProvider, useAuth } from './state/AuthContext'
import { PlayerProvider } from './state/PlayerContext'

function AppRouter() {
  const { user } = useAuth()
  const isAuthed = Boolean(user)

  return (
    <BrowserRouter>
      {isAuthed && <Navbar />}
      {isAuthed && <PlayerModal />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={isAuthed ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/" element={isAuthed ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/category/:slug" element={isAuthed ? <CategoryPage /> : <Navigate to="/login" replace />} />
        <Route path="/browse" element={isAuthed ? <BrowsePage /> : <Navigate to="/login" replace />} />
        <Route path="/liked" element={isAuthed ? <LikedSongsPage /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={isAuthed ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={isAuthed ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <AuthProvider>
      <PlayerProvider>
        <AppRouter />
      </PlayerProvider>
    </AuthProvider>
  </StrictMode>
)



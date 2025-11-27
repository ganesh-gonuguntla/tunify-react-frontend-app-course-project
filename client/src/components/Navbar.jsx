import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { motion } from 'framer-motion'
import '../styles/navbar.css'

export default function Navbar() {
  const { logout, user } = useAuth()
  const location = useLocation()

  if (['/login', '/register'].includes(location.pathname)) return null

  return (
    <header className="navbar">

      {/* LEFT SIDE - LOGO */}
      <motion.h1
        className="navbar-logo"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        Tunify <i className="bi bi-music-note-beamed logo-music-icon"></i>
      </motion.h1>



      <div className="navbar-container">

        {/* RIGHT SIDE - USER + LOGOUT */}
        <div className="navbar-right">

          {/* Only show Home button when NOT already on home */}
          {location.pathname !== "/" && (
            <Link to="/" className="navbar-home-btn">
              <motion.span whileHover={{ scale: 1.1 }} style={{ display: 'inline-block' }}>
                Home
              </motion.span>
            </Link>
          )}

          <Link
            to="/browse"
            className="navbar-home-btn"
            style={{ marginLeft: location.pathname !== '/' ? '10px' : '0' }}
          >
            <motion.span whileHover={{ scale: 1.1 }} style={{ display: 'inline-block' }}>
              Browse
            </motion.span>
          </Link>

          <Link to="/profile" className="navbar-username">
            <motion.span whileHover={{ scale: 1.1, color: '#1db954' }} style={{ display: 'inline-block' }}>
              {user?.username || "Profile"}
            </motion.span>
          </Link>

          <motion.button
            onClick={logout}
            className="logout-button"
            whileHover={{ scale: 1.05, backgroundColor: '#d32f2f' }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>

        </div>

      </div>
    </header>
  )
}

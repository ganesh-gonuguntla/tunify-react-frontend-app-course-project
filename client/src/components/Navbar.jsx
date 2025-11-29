import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { logout, user } = useAuth()
  const location = useLocation()

  if (['/login', '/register'].includes(location.pathname)) return null

  return (
    <header className="w-full bg-[linear-gradient(135deg,#000000,#6a0dad)] backdrop-blur-[10px] border-b border-[#e5e5e5] sticky top-0 z-20">

      {/*(Logo + Right Items in same line) */}
      <div className="max-w-[1400px] w-full mx-auto px-[16px] py-[4px] flex items-center justify-between flex-nowrap">

        {/* LEFT SIDE - LOGO */}
        <motion.h1
          className="text-[50px] ml-0 font-bold text-[snow] no-underline hover:scale-[1.02] transition-transform duration-200 whitespace-nowrap"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Tunify{' '}
          <i className="bi bi-music-note-beamed hover:rotate-[360deg] transition-transform duration-[800ms] ease-in-out"></i>
        </motion.h1>


        {/* RIGHT SIDE - MENU ITEMS */}
        <div className="flex items-center gap-[30px] whitespace-nowrap ml-0">

          {/* Home Button (only if not already on home) */}
          {location.pathname !== "/" && (
            <Link to="/" className="text-[20px] text-[snow] font-medium hover:underline hover:scale-[1.03] transition">
              <motion.span whileHover={{ scale: 1.1 }} style={{ display: 'inline-block' }}>
                Home
              </motion.span>
            </Link>
          )}

          {/* Browse Button */}
          <Link
            to="/browse"
            className="text-[20px] text-[snow] no-underline font-medium hover: hover:scale-[1.03] transition"
          >
            <motion.span whileHover={{ scale: 1.1 }}>
              Browse
            </motion.span>
          </Link>

          {/* Username / Profile */}
          <Link to="/profile" className="text-[20px] text-[snow] no-underline font-medium hover: hover:scale-[1.03] transition">
            <motion.span whileHover={{ scale: 1.1, color: '#1db954' }}>
              {user?.username || "Profile"}
            </motion.span>
          </Link>

          {/* Logout Button */}
          <motion.button
            onClick={logout}
            className="px-[14px] py-[6px] rounded-[6px]  text-[#2d004d] font-bold transition hover:bg-[#7a7474]"
            whileHover={{ scale: 1.05, backgroundColor: '#d32f2f', color: 'white' }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </header>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import '../styles/navbar.css'

export default function Navbar() {
  const { logout, user } = useAuth()
  const location = useLocation()

  if (['/login', '/register'].includes(location.pathname)) return null

  return (
    <header className="navbar">

      {/* LEFT SIDE - LOGO */}
      <h1 className="navbar-logo"> Tunify <i className="bi bi-music-note-beamed logo-music-icon"></i> </h1>



      <div className="navbar-container">

        {/* RIGHT SIDE - USER + LOGOUT */}
        <div className="navbar-right">

           {/* Only show Home button when NOT already on home */}
          {location.pathname !== "/" && (
            <Link to="/" className="navbar-home-btn">
              Home
            </Link>
          )}

          <Link
            to="/browse"
            className="navbar-home-btn"
            style={{ marginLeft: location.pathname !== '/' ? '10px' : '0' }}
          >
            Browse
          </Link>
          
          <Link to="/profile" className="navbar-username">
            {user?.username || "Profile"}
          </Link>

          <button onClick={logout} className="logout-button">
            Logout
          </button>
          
        </div>

      </div>
    </header>
  )
}

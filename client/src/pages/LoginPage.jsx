import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import '../styles/login.css'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.message) {
      setInfo(location.state.message)
    }
  }, [location.state])

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Please provide username and password')
      return
    }
    setLoading(true)
    setError('')
    setInfo('')

    try {
      await login(username.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">

      {/* LEFT HALF IMAGE */}
      <div className="login-image"></div>

      {/* RIGHT HALF FORM */}
      <div className="login-right">
        <form onSubmit={submit} className="login-form">
          
          <h1 className="login-title">Login</h1>

          {info && <div className="login-info">{info}</div>}
          {error && <div className="login-error">{error}</div>}

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="login-input"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="login-input"
          />

          <button disabled={loading} className="login-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="login-register">
            New user?{' '}
            <Link to="/register" className="register-link">
              Register
            </Link>
          </div>
        </form>
      </div>

    </div>
  )
}

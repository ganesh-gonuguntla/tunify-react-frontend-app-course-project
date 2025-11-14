import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import '../styles/login.css'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()

    if (!username.trim() || !password || !confirm) {
      setError('All fields are required')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      await register(username.trim(), password)
      setLoading(false)
      navigate('/login', { state: { message: 'Registration successful. Please sign in.' } })
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Unable to register')
      setLoading(false)
    }
  }

  return (
    <div className="register-container">

      {/* LEFT image section */}
      <div className="register-left"></div>

      {/* RIGHT section with form */}
      <div className="register-right">
        <form onSubmit={submit} className="register-form">

          <h1 className="register-title">Create Account</h1>

          {error && <div className="register-error">{error}</div>}

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="register-input"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="register-input"
          />

          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm Password"
            type="password"
            className="register-input"
          />

          <button disabled={loading} className="register-button">
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="register-link-area">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </div>
        </form>
      </div>

    </div>
  )
}

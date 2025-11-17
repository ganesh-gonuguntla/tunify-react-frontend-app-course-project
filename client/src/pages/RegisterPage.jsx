import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { api } from '../utils/api'
import '../styles/login.css'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState([])
  const { register } = useAuth()
  const navigate = useNavigate()
  const usernameCheckTimeoutRef = useRef(null)

  // Password validation regex
  const validatePassword = (pwd) => {
    const errors = []
    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push('Password must contain at least one special character')
    }
    return errors
  }

  const checkUsernameUnique = async (name) => {
    try {
      const { data } = await api.get(`/authUsers?username=${encodeURIComponent(name)}`)
      return data.length === 0
    } catch {
      return false
    }
  }

  // Real-time username validation
  useEffect(() => {
    // Clear existing timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current)
    }

    // If error is about username and user is typing, check uniqueness
    if (username.trim() && error && error.includes('Username already exists')) {
      usernameCheckTimeoutRef.current = setTimeout(async () => {
        const isUnique = await checkUsernameUnique(username.trim())
        if (isUnique) {
          // Clear the error if username is now unique
          setError('')
        }
      }, 500) // Debounce for 500ms to avoid too many API calls
    }

    // Cleanup timeout on unmount or when username changes
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current)
      }
    }
  }, [username, error])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setPasswordErrors([])

    if (!username.trim() || !password || !confirm) {
      setError('All fields are required')
      return
    }

    // Check username uniqueness
    const isUnique = await checkUsernameUnique(username.trim())
    if (!isUnique) {
      setError('Username already exists. Please choose a different username.')
      return
    }

    // Validate password
    const pwdErrors = validatePassword(password)
    if (pwdErrors.length > 0) {
      setPasswordErrors(pwdErrors)
      setError('Password does not meet requirements')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

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
            onChange={(e) => {
              setUsername(e.target.value)
              // Clear username error immediately when user starts typing
              if (error && error.includes('Username already exists')) {
                setError('')
              }
            }}
            placeholder="Username"
            className="register-input"
            required
          />

          <div>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (e.target.value) {
                  setPasswordErrors(validatePassword(e.target.value))
                } else {
                  setPasswordErrors([])
                }
              }}
              placeholder="Password"
              type="password"
              className="register-input"
              required
            />
            {passwordErrors.length > 0 && (
              <div className="password-errors">
                <div className="password-errors-title">Password requirements:</div>
                <ul className="password-errors-list">
                  {passwordErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm Password"
            type="password"
            className="register-input"
            required
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

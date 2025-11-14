import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add error interceptor for better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status
      return Promise.reject(new Error(error.response.data?.message || `Server error: ${error.response.status}`))
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject(new Error('Network error: Unable to connect to server. Make sure the server is running on port 3000.'))
    } else {
      // Error in request setup
      return Promise.reject(new Error(error.message))
    }
  }
)



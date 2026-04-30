import { connectDB } from '../lib/db.js'
import { setCorsHeaders, handleOptions } from '../middleware/cors.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  if (handleOptions(req, res)) return

  try {
    const db = await connectDB()
    const usersCollection = db.collection('users')

    if (req.method === 'GET') {
      const { username } = req.query
      let filter = {}
      if (username) filter = { username }
      const users = await usersCollection.find(filter).toArray()
      const mappedUsers = users.map(user => ({ ...user, id: user._id.toString() }))
      return res.status(200).json(mappedUsers)
    }

    if (req.method === 'POST') {
      const { username, likedSongIds = [], playlists = [], history = [] } = req.body
      if (!username) return res.status(400).json({ error: 'username required' })

      const result = await usersCollection.insertOne({
        username,
        likedSongIds,
        playlists,
        history,
      })

      const created = await usersCollection.findOne({ _id: result.insertedId })
      return res.status(201).json({ ...created, id: created._id.toString() })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

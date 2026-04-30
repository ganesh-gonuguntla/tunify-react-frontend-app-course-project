import { connectDB } from '../lib/db.js'
import { setCorsHeaders, handleOptions } from '../middleware/cors.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  if (handleOptions(req, res)) return

  try {
    const db = await connectDB()
    const authUsersCollection = db.collection('authUsers')

    if (req.method === 'GET') {
      const { username } = req.query
      let filter = {}
      if (username) filter = { username }
      const authUsers = await authUsersCollection.find(filter).toArray()
      const mappedAuthUsers = authUsers.map(user => ({ ...user, id: user._id.toString() }))
      return res.status(200).json(mappedAuthUsers)
    }

    if (req.method === 'POST') {
      const { username, password } = req.body
      if (!username || !password) {
        return res.status(400).json({ error: 'username and password required' })
      }

      const result = await authUsersCollection.insertOne({ username, password })
      const created = await authUsersCollection.findOne({ _id: result.insertedId })
      return res.status(201).json({ ...created, id: created._id.toString() })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

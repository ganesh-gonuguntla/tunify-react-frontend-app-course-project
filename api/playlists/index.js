import { connectDB } from '../lib/db.js'
import { setCorsHeaders, handleOptions } from '../middleware/cors.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  if (handleOptions(req, res)) return

  try {
    const db = await connectDB()
    const playlistsCollection = db.collection('playlists')

    if (req.method === 'GET') {
      const { userId } = req.query
      let filter = {}
      if (userId) filter = { userId }
      const playlists = await playlistsCollection.find(filter).toArray()
      const mappedPlaylists = playlists.map(pl => ({ ...pl, id: pl.id || pl._id.toString() }))
      return res.status(200).json(mappedPlaylists)
    }

    if (req.method === 'POST') {
      const playlistData = req.body
      if (!playlistData) return res.status(400).json({ error: 'Playlist data required' })

      const result = await playlistsCollection.insertOne(playlistData)
      const created = await playlistsCollection.findOne({ _id: result.insertedId })
      return res.status(201).json({ ...created, id: created.id || created._id.toString() })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

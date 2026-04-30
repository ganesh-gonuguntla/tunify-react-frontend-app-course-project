import { connectDB } from '../lib/db.js'
import { setCorsHeaders, handleOptions } from '../middleware/cors.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  if (handleOptions(req, res)) return

  try {
    const db = await connectDB()
    const songsCollection = db.collection('songs')

    if (req.method === 'GET') {
      const songs = await songsCollection.find({}).toArray()
      const mappedSongs = songs.map(song => ({ ...song, id: song.id || song._id.toString() }))
      return res.status(200).json(mappedSongs)
    }

    if (req.method === 'POST') {
      const songData = req.body
      if (!songData) return res.status(400).json({ error: 'Song data required' })

      const result = await songsCollection.insertOne(songData)
      const created = await songsCollection.findOne({ _id: result.insertedId })
      return res.status(201).json({ ...created, id: created.id || created._id.toString() })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

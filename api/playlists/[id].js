import { ObjectId } from 'mongodb'
import { connectDB } from '../lib/db.js'
import { setCorsHeaders, handleOptions } from '../middleware/cors.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  if (handleOptions(req, res)) return

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const db = await connectDB()
    const playlistsCollection = db.collection('playlists')
    
    // For json-server compatibility, IDs might be strings instead of ObjectIds
    // We will query by both if it is a valid ObjectId, otherwise just by string id.
    const query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { id: id }] } : { id: id }

    if (req.method === 'GET') {
      const playlist = await playlistsCollection.findOne(query)
      if (!playlist) return res.status(404).json({ error: 'Playlist not found' })
      return res.status(200).json({ ...playlist, id: playlist.id || playlist._id.toString() })
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const update = { ...req.body }
      delete update._id
      delete update.id

      const result = await playlistsCollection.updateOne(query, { $set: update })
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Playlist not found' })
      const updated = await playlistsCollection.findOne(query)
      return res.status(200).json({ ...updated, id: updated.id || updated._id.toString() })
    }

    if (req.method === 'DELETE') {
      const result = await playlistsCollection.deleteOne(query)
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Playlist not found' })
      return res.status(204).end()
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

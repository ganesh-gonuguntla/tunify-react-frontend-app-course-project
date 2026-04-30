import { ObjectId } from 'mongodb'
import { connectDB } from '../lib/db.js'
import { setCorsHeaders, handleOptions } from '../middleware/cors.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  if (handleOptions(req, res)) return

  const { id } = req.query

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const db = await connectDB()
    const usersCollection = db.collection('users')
    const objectId = new ObjectId(id)

    if (req.method === 'GET') {
      const user = await usersCollection.findOne({ _id: objectId })
      if (!user) return res.status(404).json({ error: 'User not found' })
      return res.status(200).json({ ...user, id: user._id.toString() })
    }

    if (req.method === 'PUT') {
      const update = req.body
      const result = await usersCollection.updateOne({ _id: objectId }, { $set: update })
      if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' })
      const updated = await usersCollection.findOne({ _id: objectId })
      return res.status(200).json({ ...updated, id: updated._id.toString() })
    }

    if (req.method === 'DELETE') {
      const result = await usersCollection.deleteOne({ _id: objectId })
      if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' })
      return res.status(204).end()
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

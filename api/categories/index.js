import { connectDB } from '../lib/db.js'
import { setCorsHeaders, handleOptions } from '../middleware/cors.js'

export default async function handler(req, res) {
  setCorsHeaders(res)
  if (handleOptions(req, res)) return

  try {
    const db = await connectDB()
    const categoriesCollection = db.collection('categories')

    if (req.method === 'GET') {
      const categories = await categoriesCollection.find({}).toArray()
      const mappedCategories = categories.map(cat => ({ ...cat, id: cat.id || cat._id.toString() }))
      return res.status(200).json(mappedCategories)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

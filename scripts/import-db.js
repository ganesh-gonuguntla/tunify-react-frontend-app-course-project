/**
 * Import script: Migrate db.json data to MongoDB Atlas
 * Usage: node scripts/import-db.js
 * 
 * Set MONGODB_URI in .env before running
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI environment variable is not set')
  process.exit(1)
}

async function importDB() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('tunify')

    // Read db.json
    const dbPath = path.join(__dirname, '../client/db.json')
    const rawData = readFileSync(dbPath, 'utf8')
    const data = JSON.parse(rawData)

    // Clear existing collections
    await db.collection('users').deleteMany({})
    await db.collection('authUsers').deleteMany({})

    // Import users
    if (data.users && data.users.length > 0) {
      // Convert string IDs to MongoDB ObjectId if needed, or keep as is
      const users = data.users.map((user) => ({
        ...user,
        // Keep id as string or convert: new ObjectId(user.id) if you prefer
      }))
      const usersResult = await db.collection('users').insertMany(users)
      console.log(`✓ Imported ${usersResult.insertedCount} users`)
    }

    // Import authUsers (if present in db.json)
    if (data.authUsers && data.authUsers.length > 0) {
      const authUsersResult = await db.collection('authUsers').insertMany(data.authUsers)
      console.log(`✓ Imported ${authUsersResult.insertedCount} auth users`)
    }

    console.log('✓ Import complete')
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

importDB()

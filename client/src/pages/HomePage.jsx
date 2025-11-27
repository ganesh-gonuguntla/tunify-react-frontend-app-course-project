import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import CategoryCard from '../components/CategoryCard'
import LikedCard from '../components/LikedCard'
import { motion } from 'framer-motion'
import '../styles/navbar.css'

export default function HomePage() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data))
  }, [])

  return (
    <motion.div
      className="home-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >     {/* NEW WRAPPER */}
      <main className="home-container">
        <p className="home-title">Browse by Category</p>

        <div className="category-grid">
          <LikedCard />
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </main>
    </motion.div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import CategoryCard from '../components/CategoryCard'
import LikedCard from '../components/LikedCard'
import '../styles/navbar.css'

export default function HomePage() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data))
  }, [])

  return (
    <div className="home-background">     {/* NEW WRAPPER */}
      <main className="home-container">
        <p className="home-title">Browse by Category</p>

        <div className="category-grid">
          <LikedCard />
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </main>
    </div>
  )
}

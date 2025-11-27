import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/navbar.css'

export default function CategoryCard({ category }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/category/${category.slug}`}
        className={`category-card category-${category.slug}`}
      >
        <div className="category-overlay">
          <div className="category-name">{category.name}</div>
          <div className="category-subtext">Tap to explore</div>
        </div>
      </Link>
    </motion.div>
  )
}

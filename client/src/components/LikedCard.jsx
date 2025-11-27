import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/navbar.css'

export default function LikedCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Link to="/liked" className="category-card category-liked">
        <div className="category-overlay">
          <div className="category-name">Liked Songs</div>
          <div className="category-subtext">View all your liked tracks</div>
        </div>
      </Link>
    </motion.div>
  )
}

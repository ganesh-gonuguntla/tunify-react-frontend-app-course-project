import { Link } from 'react-router-dom'
import '../styles/navbar.css'

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className={`category-card category-${category.slug}`}
    >
      <div className="category-overlay">
        <div className="category-name">{category.name}</div>
        <div className="category-subtext">Tap to explore</div>
      </div>
    </Link>
  )
}

import { Link } from 'react-router-dom'
import '../styles/navbar.css'

export default function LikedCard() {
  return (
    <Link to="/liked" className="category-card category-liked">
      <div className="category-overlay">
        <div className="category-name">Liked Songs</div>
        <div className="category-subtext">View all your liked tracks</div>
      </div>
    </Link>
  )
}

import { motion } from 'framer-motion'

export default function PlaylistCard({ playlist, onClick }) {
  return (
    <motion.div
      className="playlist-card-grid"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="playlist-card-icon">🎵</div>
      <div className="playlist-card-name">{playlist.name}</div>
      <div className="playlist-card-count">{(playlist.songIds || []).length} song{(playlist.songIds || []).length !== 1 ? 's' : ''}</div>
    </motion.div>
  )
}

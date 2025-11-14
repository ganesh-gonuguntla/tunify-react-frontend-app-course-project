export default function PlaylistCard({ playlist, onClick }) {
  return (
    <div className="playlist-card-grid" onClick={onClick}>
      <div className="playlist-card-icon">🎵</div>
      <div className="playlist-card-name">{playlist.name}</div>
      <div className="playlist-card-count">{(playlist.songIds || []).length} song{(playlist.songIds || []).length !== 1 ? 's' : ''}</div>
    </div>
  )
}

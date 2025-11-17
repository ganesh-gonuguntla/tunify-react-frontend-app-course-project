import { usePlayer } from '../state/PlayerContext'
import '../styles/modal.css'

export default function PlayerModal() {
  const {
    current,
    isPlaying,
    play,
    pause,
    next,
    prev,
    queue,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    loop,
    setLoop,
  } = usePlayer()

  // Don't show modal if no song is loaded
  if (!current) return null

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = clickX / rect.width
    const newTime = percent * duration
    seek(newTime)
  }

  return (
    <div className="player-modal-overlay">
      <div className="player-modal">
        <div className="player-modal-content">
          {/* Song Info with Rotating Cover */}
          <div className="player-song-info">
            <div className={`player-cover-container ${isPlaying ? 'rotating' : ''}`}>
              <img
                src={current.coverUrl || 'https://via.placeholder.com/80'}
                alt={current.title}
                className="player-cover"
              />
            </div>
            <div className="player-song-details">
              <div className="player-song-title">{current.title}</div>
              <div className="player-song-artist">{current.artist}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="player-progress-section">
            <div className="player-time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="player-progress-bar" onClick={handleProgressClick}>
              <div
                className="player-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="player-progress-handle"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Main Controls */}
          <div className="player-controls">
            <button
              onClick={() => setLoop(!loop)}
              className={`player-control-btn ${loop ? 'active' : ''}`}
              title="Loop"
            >
              🔁
            </button>
            <button onClick={prev} className="player-control-btn" disabled={queue.length <= 1}>
              ⏮
            </button>
            <button
              onClick={isPlaying ? pause : play}
              className="player-control-btn player-play-pause"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={next} className="player-control-btn" disabled={queue.length <= 1}>
              ⏭
            </button>
            <div className="player-volume-control">
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="player-volume-slider"
              />
              <span className="player-volume-value">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


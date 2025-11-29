import { usePlayer } from '../state/PlayerContext'


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
    closePlayer,
    currentIndex,
    shuffle,
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
    <div className="fixed bottom-[20px] left-1/2 -translate-x-1/2 z-[1500] animate-[slideUp_0.3s_ease-out]">
      <div className="bg-[linear-gradient(135deg,#000000,#2d004d,#6a0dad)] rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] pl-[20px] pr-[24px] py-[10px] min-w-[500px] w-[600px]">
        <div className="flex flex-col gap-[16px]">
          {/* Song Info with Rotating Cover */}
          <div className="flex items-center gap-[12px] flex-1">
            <div className={`w-[70px] h-[70px] rounded-[50%] overflow-hidden flex items-center justify-center transition-transform duration-300 ${isPlaying ? 'rotating' : ''}`}>
              <img
                src={current.coverUrl || 'https://via.placeholder.com/80'}
                alt={current.title}
                className="animate-[rotate_10s_linear_infinite] w-[70px] h-[70px] rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">{current.title}</div>
              <div className="text-[14px] text-[#9ca3af] whitespace-nowrap overflow-hidden text-ellipsis">{current.artist}</div>
            </div>
          </div>
          {/* close button */}
          <button className="absolute top-[10px] right-[12px] text-[18px] bg-transparent border-none cursor-pointer text-white opacity-80 hover:opacity-100 transition-opacity duration-200" onClick={closePlayer}><h5>X</h5></button>

          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex justify-between text-[12px] text-[#9ca3af] mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative w-full h-[6px] bg-white/20 rounded-[3px] cursor-pointer transition-all duration-200 hover:h-[8px]" onClick={handleProgressClick}>
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-[3px] transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[12px] h-[12px] bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] opacity-0 transition-opacity duration-200 hover:opacity-100"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-[12px] justify-center">
            <button
              onClick={() => setLoop(!loop)}
              className={`bg-white/20 border-none text-white text-[20px] w-[40px] h-[40px] rounded-[50%] cursor-pointer flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/30 hover:scale-110 ${loop ? 'active' : ''}`}
              title="Loop"
            >
              🔁
            </button>
            <button onClick={prev} className="bg-white/20 border-none text-white text-[20px] w-[40px] h-[40px] rounded-[50%] cursor-pointer flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/30 hover:scale-110" disabled={queue.length <= 1 || currentIndex === 0}>
              ⏮
            </button>
            <button
              onClick={isPlaying ? pause : play}
              className="bg-white/20 border-none text-white rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/30 hover:scale-110 w-[48px] h-[48px] text-[24px] bg-white/30 hover:bg-white/40 hover:scale-115"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={next}
              className="bg-white/20 border-none text-white text-[20px] w-[40px] h-[40px] rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/30 hover:scale-110"
              disabled={queue.length <= 1 || (!shuffle && currentIndex === queue.length - 1)}
            >
              ⏭
            </button>
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/20">
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-[80px] h-[4px] bg-[rgba(255, 255, 255, 0.2)] rounded-[2px] outline-none cursor-pointer apperance-none"
              />
              <span className="text-[12px] text-[#9ca3af] min-w-[35px] text-right">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


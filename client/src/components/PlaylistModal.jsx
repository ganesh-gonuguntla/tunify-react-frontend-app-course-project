import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../state/AuthContext'
import { usePlayer } from '../state/PlayerContext'
import AddToPlaylistModal from './AddToPlaylistModal'
import '../styles/modal.css'

export default function PlaylistModal({ playlist, songs, user, onClose, onPlaylistUpdated }) {
  const { updateUser } = useAuth()
  const { current, isPlaying, playSongs, pause, play } = usePlayer()
  const [playlistSongs, setPlaylistSongs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [allPlaylists, setAllPlaylists] = useState([])

  useEffect(() => {
    const filtered = songs.filter((s) => (playlist.songIds || []).map(String).includes(String(s.id)))
    setPlaylistSongs(filtered)
  }, [songs, playlist])

  const togglePlay = (song) => {
    if (current?.id !== song.id) {
      const idx = playlistSongs.findIndex((s) => s.id === song.id)
      if (idx !== -1) {
        playSongs(playlistSongs, idx)
      } else {
        playSongs([song], 0)
      }
    } else {
      isPlaying ? pause() : play()
    }
  }

  const toggleLike = async (song) => {
    if (!user) return
    try {
      const isLiked = (user.likedSongIds || []).map(String).includes(String(song.id))
      let next
      if (isLiked) {
        next = (user.likedSongIds || []).filter((id) => String(id) !== String(song.id))
      } else {
        next = Array.from(new Set([...(user.likedSongIds || []), song.id]))
      }
      const { data } = await api.patch(`/users/${user.id}`, { likedSongIds: next })
      updateUser(data)
    } catch (err) {
      console.error('Error updating like:', err)
    }
  }

  const openAddModal = async (song) => {
    setSelectedSong(song)
    try {
      const { data: existing } = await api.get(`/playlists?userId=${user.id}`)
      setAllPlaylists(existing.filter((p) => p.id !== playlist.id))
      setShowAddModal(true)
    } catch (err) {
      console.error('Error loading playlists:', err)
    }
  }

  const removeSongFromPlaylist = async (songId) => {
    if (!window.confirm('Remove this song from the playlist?')) return
    setLoading(true)
    try {
      const next = {
        ...playlist,
        songIds: (playlist.songIds || []).filter((id) => String(id) !== String(songId)),
      }
      const { data } = await api.patch(`/playlists/${playlist.id}`, next)
      setPlaylistSongs(playlistSongs.filter((s) => s.id !== songId))
      onPlaylistUpdated && onPlaylistUpdated(data)
    } catch (err) {
      console.error('Error removing song:', err)
      alert('Failed to remove song')
    } finally {
      setLoading(false)
    }
  }

  const renamePlaylist = async () => {
    const newName = window.prompt('Rename playlist', playlist.name)
    if (!newName) return
    setLoading(true)
    try {
      const { data } = await api.patch(`/playlists/${playlist.id}`, {
        ...playlist,
        name: newName,
      })
      onPlaylistUpdated && onPlaylistUpdated(data)
    } catch (err) {
      console.error('Error renaming playlist:', err)
      alert('Failed to rename playlist')
    } finally {
      setLoading(false)
    }
  }

  const deletePlaylist = async () => {
    if (!window.confirm('Delete this entire playlist?')) return
    setLoading(true)
    try {
      await api.delete(`/playlists/${playlist.id}`)
      onPlaylistUpdated && onPlaylistUpdated(null) // Signal deletion
      onClose()
    } catch (err) {
      console.error('Error deleting playlist:', err)
      alert('Failed to delete playlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content playlist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{playlist.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body playlist-body">
          {playlistSongs.length === 0 ? (
            <div className="empty-state">No songs in this playlist yet.</div>
          ) : (
            <div className="playlist-songs-list">
              {playlistSongs.map((song) => {
                const playingThis = current?.id === song.id && isPlaying
                const isLiked = (user?.likedSongIds || []).map(String).includes(String(song.id))
                return (
                  <div key={song.id} className="playlist-song-item">
                    <div className="song-info">
                      <img src={song.coverUrl} alt={song.title} className="song-thumb" />
                      <div className="song-details">
                        <div className="song-title">{song.title}</div>
                        <div className="song-artist">{song.artist}</div>
                      </div>
                    </div>
                    <div className="song-actions">
                      <button
                        className="btn btn-sm btn-action"
                        onClick={() => togglePlay(song)}
                        title={playingThis ? 'Pause' : 'Play'}
                      >
                        {playingThis ? '⏸' : '▶'}
                      </button>
                      <button
                        className={`btn btn-sm btn-action ${isLiked ? 'liked' : ''}`}
                        onClick={() => toggleLike(song)}
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        {isLiked ? '❤️' : '🤍'}
                      </button>
                      <button
                        className="btn btn-sm btn-action"
                        onClick={() => openAddModal(song)}
                        title="Add to another playlist"
                      >
                        ➕
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeSongFromPlaylist(song.id)}
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary rename" onClick={() => renamePlaylist()} disabled={loading}>
            Rename
          </button>
          <button className="btn btn-danger" onClick={() => deletePlaylist()} disabled={loading}>
            Delete Playlist
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>

        {showAddModal && selectedSong && (
          <AddToPlaylistModal
            song={selectedSong}
            user={user}
            playlists={allPlaylists}
            onClose={() => setShowAddModal(false)}
            onAdded={() => {
              setShowAddModal(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

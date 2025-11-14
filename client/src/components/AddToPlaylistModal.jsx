import { useState } from 'react'
import { api } from '../utils/api'
import '../styles/modal.css'

export default function AddToPlaylistModal({ song, user, onClose, onAdded, playlists }) {
  const [selected, setSelected] = useState(new Set())
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [loading, setLoading] = useState(false)

  const togglePlaylist = (playlistId) => {
    const next = new Set(selected)
    if (next.has(playlistId)) {
      next.delete(playlistId)
    } else {
      next.add(playlistId)
    }
    setSelected(next)
  }

  const handleAddToExisting = async () => {
    if (!selected.size) {
      alert('Please select at least one playlist')
      return
    }
    setLoading(true)
    try {
      for (const playlistId of selected) {
        const playlist = playlists.find((p) => p.id === playlistId)
        if (playlist) {
          const next = {
            ...playlist,
            songIds: Array.from(new Set([...(playlist.songIds || []), song.id])),
          }
          await api.patch(`/playlists/${playlistId}`, next)
        }
      }
      onAdded && onAdded()
      onClose()
    } catch (err) {
      console.error('Error adding to playlists:', err)
      alert('Failed to add song to playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim()) {
      alert('Please enter a playlist name')
      return
    }
    setLoading(true)
    try {
      const created = await api.post('/playlists', {
        userId: user.id,
        name: newPlaylistName,
        songIds: [song.id],
      })
      onAdded && onAdded(created.data)
      onClose()
    } catch (err) {
      console.error('Error creating playlist:', err)
      alert('Failed to create playlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-to-playlist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add "{song.title}" to Playlist</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* EXISTING PLAYLISTS */}
          {playlists.length > 0 && (
            <div className="playlist-section">
              <h3>Existing Playlists</h3>
              <div className="playlist-checkboxes">
                {playlists.map((pl) => (
                  <label key={pl.id} className="playlist-checkbox">
                    <input
                      type="checkbox"
                      checked={selected.has(pl.id)}
                      onChange={() => togglePlaylist(pl.id)}
                      disabled={loading}
                    />
                    <span>{pl.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* CREATE NEW PLAYLIST */}
          <div className="playlist-section">
            <h3>Create New Playlist</h3>
            <div className="create-playlist-form">
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                disabled={loading}
                className="playlist-input"
              />
            </div>
          </div>
        </div>

        {/* MODAL ACTIONS */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          {selected.size > 0 && (
            <button className="btn btn-primary" onClick={handleAddToExisting} disabled={loading}>
              {loading ? 'Adding...' : `Add to ${selected.size} Playlist${selected.size > 1 ? 's' : ''}`}
            </button>
          )}
          {newPlaylistName.trim() && (
            <button className="btn btn-success" onClick={handleCreateAndAdd} disabled={loading}>
              {loading ? 'Creating...' : 'Create & Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

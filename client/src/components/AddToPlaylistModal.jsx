import { useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../utils/api'


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

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="bg-[#fcfcfc] rounded-[12px] max-w-[600px] w-[90%] max-h-[90vh] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-[20px] rounded-[5px] border-b border-[#e5e5e5] bg-[#6a0dad]">
          <h2 className="text-white font-semibold">
            Add "{song.title}" to Playlist
          </h2>
          <button className="text-black text-[25px]  bg-[#c0eafeff] rounded-[5px]" onClick={onClose}>
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 bg-white">
          {playlists.length > 0 && (
            <div className="mb-[20px]">
              <h3 className="text-[#2d004d] font-semibold mb-[12px] uppercase tracking-[0.5px]">
                Existing Playlists
              </h3>
              <div className="flex flex-col gap-[10px]">
                {playlists.map((pl) => (
                  <label
                    key={pl.id}
                    className="flex items-center gap-[10px] cursor-pointer p-[10px] rounded-[8px] hover:bg-[#f0e6ff] transition duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(pl.id)}
                      onChange={() => togglePlaylist(pl.id)}
                      disabled={loading}
                      className="w-[18px] h-[18px] accent-[#6a0dad]"
                    />
                    <span className="text-[14px] text-[#333] font-medium">{pl.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* CREATE NEW PLAYLIST */}
          <div className="mb-[20px]">
            <h3 className="text-[#2d004d] font-semibold mb-[12px] uppercase tracking-[0.5px]">
              Create New Playlist
            </h3>
            <div className="flex gap-[10px]">
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                disabled={loading}
                className="flex-1 px-[10px] py-[12px] border-[2px] border-[#ddd] rounded-[8px] focus:outline-none focus:border-[#6a0dad] focus:shadow-[0_0_0_3px_rgba(106,13,173,0.1)]"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-[10px] px-[16px] py-[20px] border-t border-[#e5e5e5] bg-[#fcfcfc] justify-end">
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
    </div>,
    document.body
  )
}

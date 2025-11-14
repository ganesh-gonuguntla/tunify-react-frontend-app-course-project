const ITUNES_ENDPOINT = 'https://itunes.apple.com/search'

// Map iTunes track to our Song shape
function mapItunesTrackToSong(track, category) {
  return {
    id: track.trackId,
    title: track.trackName,
    artist: track.artistName,
    category,
    audioUrl: track.previewUrl,
    coverUrl: track.artworkUrl100,
  }
}

export async function fetchSongsByCategoryFromInternet(categorySlug, limit = 25) {
  const term = encodeURIComponent(categorySlug)
  const url = `${ITUNES_ENDPOINT}?term=${term}&media=music&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch from iTunes API')
  const json = await res.json()
  const tracks = Array.isArray(json.results) ? json.results.filter((t) => t.previewUrl) : []
  return tracks.map((t) => mapItunesTrackToSong(t, categorySlug))
}



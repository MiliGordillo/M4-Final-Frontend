const API_BASE = '/api/spotify';

export async function getTrack(id) {
  const res = await fetch(`${API_BASE}/track/${id}`);
  return await res.json();
}

export async function getArtist(id) {
  const res = await fetch(`${API_BASE}/artist/${id}`);
  return await res.json();
}

export async function getArtistTopTracks(id, market = 'US') {
  const res = await fetch(`${API_BASE}/artist/${id}/top-tracks?market=${market}`);
  return await res.json();
}

export async function getArtistAlbums(id) {
  const res = await fetch(`${API_BASE}/artist/${id}/albums`);
  return await res.json();
}

export async function getAlbum(id) {
  const res = await fetch(`${API_BASE}/album/${id}`);
  return await res.json();
}

export async function getPlaylist(id) {
  const res = await fetch(`${API_BASE}/playlist/${id}`);
  return await res.json();
}

export async function getRecommendations(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/recommendations?${query}`);
  return await res.json();
}
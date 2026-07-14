export async function loadPlaylist(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Could not load playlist: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

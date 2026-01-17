export async function submitVote({
  username,
  server,
  discordId,
  secret,
  token,
}: {
  username: string;
  server: string;
  discordId?: string;
  secret?: string;
  token?: string;
}) {
  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, server, discordId, secret, token }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Vote failed (${res.status})`);
    }
    return json.data;
  } catch (err) {
    console.error('Vote submit error:', err);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const csvUrl = process.env.LOGIN_CSV_URL;
    if (!csvUrl) {
      return res.status(500).json({ error: 'LOGIN_CSV_URL is missing' });
    }

    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) {
      return res.status(502).json({ error: 'Could not load login sheet' });
    }

    const csvText = await response.text();
    const rows = csvText.split('\n');

    let foundUser = null;

    for (let i = 0; i < rows.length; i++) {
      const cols = rows[i].split(',');
      if (cols.length >= 2) {
        const csvUser = cols[0].trim();
        const csvPass = cols[1].trim();

        if (
          csvUser.toLowerCase() === String(username).trim().toLowerCase() &&
          csvPass === String(password).trim()
        ) {
          foundUser = csvUser;
          break;
        }
      }
    }

    if (!foundUser) {
      return res.status(401).json({ ok: false });
    }

    return res.status(200).json({
      ok: true,
      displayName: foundUser,
      userKey: foundUser.toLowerCase()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || `http://localhost:${process.env.API_PORT || 3300}`;
const IMAGE_PATH = process.argv[2] || path.join(__dirname, 'test-image.png');
const EMAIL = process.env.TEST_EMAIL || 'admin@rentnride.com';
const PASSWORD = process.env.TEST_PASSWORD || 'admin123';

const mimeByExt = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

async function ensureImage() {
  if (fs.existsSync(IMAGE_PATH)) return;
  console.warn(`Image not found at ${IMAGE_PATH}. Downloading placeholder image...`);
  const res = await fetch('https://via.placeholder.com/150');
  if (!res.ok) throw new Error('Failed to download placeholder image');
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(IMAGE_PATH, buf);
  console.info('Placeholder image saved to', IMAGE_PATH);
}

(async () => {
  try {
    console.info('API URL:', API_URL);

    await ensureImage();

    // 1) Login
    const loginResp = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    if (!loginResp.ok) {
      const t = await loginResp.text();
      console.error('Login failed:', loginResp.status, t);
      process.exit(1);
    }

    const loginJson = await loginResp.json();
    const token = loginJson.accessToken;
    if (!token) {
      console.error('No accessToken received from /auth/login');
      process.exit(1);
    }

    console.info('Obtained access token. Preparing upload...');

    // 2) Prepare multipart body
    const fileBuffer = fs.readFileSync(IMAGE_PATH);
    const filename = path.basename(IMAGE_PATH);
    const ext = path.extname(filename).toLowerCase();
    const mimetype = mimeByExt[ext] || 'application/octet-stream';
    const boundary = '----BikeHubFormBoundary' + Math.random().toString(16).slice(2);

    const pre = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimetype}\r\n\r\n`;
    const post = `\r\n--${boundary}--\r\n`;
    const bodyBuffer = Buffer.concat([Buffer.from(pre), fileBuffer, Buffer.from(post)]);

    // 3) Upload
    const uploadResp = await fetch(`${API_URL}/uploads/image`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${token}`,
      },
      body: bodyBuffer,
    });

    const text = await uploadResp.text();
    console.info('Upload response status:', uploadResp.status);
    console.log(text);

    if (!uploadResp.ok) process.exit(1);
  } catch (err) {
    console.error('Error during test upload:', err);
    process.exit(1);
  }
})();

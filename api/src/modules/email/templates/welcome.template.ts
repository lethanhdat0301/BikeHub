export interface WelcomeTemplateOptions {
  baseUrl?: string;
  name: string;
  profileUrl?: string;
  logoSrc?: string;
}

export function buildWelcomeHtml(opts: WelcomeTemplateOptions): string {
  const {
    baseUrl = '/',
    name,
    profileUrl = '/setting-profile/',
    logoSrc = 'cid:logo',
  } = opts;

  const esc = (s: string | null | undefined) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Welcome to BikeHub</title>
  </head>
  <body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f5f7fb; margin:0; padding:40px; color:#333;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px; margin:0 auto;">
      <tr>
        <td style="background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 6px 30px rgba(10,10,10,0.06); padding:28px;">
          <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px;">
            <img src="${esc(logoSrc)}" alt="BikeHub" style="height:46px; width:auto;" />
            <h1 style="font-size:20px; margin:0; color:#111;">Welcome to BikeHub</h1>
          </div>

          <p style="font-size:15px; color:#444; line-height:1.6;">Hi ${esc(name)},</p>

          <p style="font-size:15px; color:#444; line-height:1.6;">We're thrilled to have you on board — BikeHub is your place for easy, reliable bike rentals. To get started, set up your profile so we can serve you better.</p>

          <p style="margin:18px 0;">
            <a href="${baseUrl.replace(/\/$/, '')}${profileUrl}" style="background:#f7c50c; color:#fff; padding:12px 18px; border-radius:6px; text-decoration:none; font-weight:700;">Set up my profile</a>
          </p>

          <p style="color:#6b7280; font-size:13px;">If you have any questions, reply to this email or visit our Help Center.</p>

          <hr style="border:none; border-top:1px solid #eee; margin:22px 0;" />

          <p style="font-size:12px; color:#9aa0a6; margin:0;">RentNRide • Keangnam Landmark 72 • Ha Noi • +1 234 567 890</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

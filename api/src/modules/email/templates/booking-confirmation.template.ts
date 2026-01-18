export interface BookingTemplateOptions {
  baseUrl?: string;
  name: string;
  bookingId: string;
  pickupLocation?: string | null;
  contactMethod?: string | null;
  contactDetail?: string | null;
  serverName?: string | null;
  daysToDisconnect?: number | null;
  logoSrc?: string;
}

export function buildBookingConfirmationHtml(opts: BookingTemplateOptions): string {
  const {
    baseUrl = '/',
    name,
    bookingId,
    pickupLocation = '',
    contactMethod = '',
    contactDetail = '',
    serverName = '',
    daysToDisconnect = null,
    logoSrc = 'cid:logo',
  } = opts;

  // Clean/escape minimal characters to avoid breaking HTML (not a full sanitizer)
  const esc = (s: string | null | undefined) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const daysText = daysToDisconnect !== null && daysToDisconnect !== undefined ? `in ${daysToDisconnect} calendar day${daysToDisconnect === 1 ? '' : 's'}` : '';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Booking confirmation</title>
  </head>
  <body style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color:#2b2b2b; margin:0; padding:0; background:#f5f7fb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb; padding:30px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:6px; overflow:hidden; box-shadow:0 2px 6px rgba(16,24,40,0.08);">
            <tr style="background:#f7c50c;">
              <td style="padding:18px 24px; display:flex; align-items:center;">
                <img src="${esc(logoSrc)}" alt="logo" style="height:38px; width:auto; margin-right:12px;" />
                <div style="color:#fff; font-weight:700; font-size:18px;">RentNRide</div>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px; color:#3b3b3b;">
                <p style="margin:0 0 12px 0;">Dear ${esc(name)},</p>

                <p style="margin:0 0 12px 0; line-height:1.45;">Your booking request <strong>No. ${esc(bookingId)}</strong> has been received successfully<span style="color:#e55365">&nbsp; ✅</span></p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="vertical-align:top; padding-right:12px; width:50%;">
                      <div style="font-size:13px; color:#6b7280;">Pickup location</div>
                      <div style="font-weight:600; margin-top:6px;">${esc(pickupLocation)}</div>
                    </td>
                    <td style="vertical-align:top; padding-left:12px; width:50%;">
                      <div style="font-size:13px; color:#6b7280;">Contact method</div>
                      <div style="font-weight:600; margin-top:6px;">${esc(contactMethod)}: ${esc(contactDetail)}</div>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 12px 0;">.</p>
                
                <p style="margin:0 0 12px 0; line-height:1.45;">We will contact you soon to confirm availability</p>
                <hr style="border:none; border-top:1px solid #eee; margin:18px 0" />

                ${serverName ? `<p style="margin:0 0 12px 0; font-weight:600;">${esc(serverName)}</p>` : ''}

                <p style="margin:16px 0;">
                  <a href="${baseUrl}tracking" style="display:inline-block; background:#f7c50c; color:#fff; text-decoration:none; padding:10px 14px; border-radius:4px; font-weight:600;">Track your booking</a>
                </p>


                <p style="margin:18px 0 0 0; color:#6b7280; font-size:13px;">Any questions are welcome,<br/>Yours faithfully,<br/>RentNRide Support</p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 24px; font-size:12px; color:#9aa0a6; background:#fafafa;">
                RentNRide, <a href="https://www.rentnride.travel/" style="color:#9aa0a6; text-decoration:underline;">https://www.rentnride.travel/</a>, +84 388 817 935
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface RentalTemplateOptions {
  baseUrl?: string;
  name: string;
  bookingId: string;
  bikeModel?: string | null;
  bikeCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  pickupLocation?: string | null;
  price?: number | null;
  dealerName?: string | null;
  dealerPhone?: string | null;
  logoSrc?: string;
}

export function buildRentalConfirmationHtml(opts: RentalTemplateOptions): string {
  const {
    baseUrl = '/',
    name,
    bookingId,
    bikeModel = '',
    bikeCode = '',
    startDate = '',
    endDate = '',
    pickupLocation = '',
    price = null,
    dealerName = '',
    dealerPhone = '',
    logoSrc = 'cid:logo',
  } = opts;

  const esc = (s: any) => (s === null || s === undefined ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Rental confirmation</title>
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

                <p style="margin:0 0 12px 0; line-height:1.45;">Your motorcycles rental booking <strong>No. ${esc(bookingId)}</strong> has been received and is pending confirmation<span style="color:#e55365">&nbsp; ✅</span></p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin-top:8px;">
                  <tr>
                    <td style="vertical-align:top; padding-right:12px; width:50%;">
                      <div style="font-size:13px; color:#6b7280;">Motorcycles</div>
                      <div style="font-weight:600; margin-top:6px;">${esc(bikeModel)} (${esc(bikeCode)})</div>
                    </td>
                    <td style="vertical-align:top; padding-left:12px; width:50%;">
                      <div style="font-size:13px; color:#6b7280;">Period</div>
                      <div style="font-weight:600; margin-top:6px;">${esc(startDate)} - ${esc(endDate)}</div>
                    </td>
                  </tr>
                </table>

                <p style="margin:8px 0 0 0; color:#6b7280; font-size:13px;">Pickup: <strong>${esc(pickupLocation)}</strong></p>
                <p style="margin:8px 0 0 0; color:#6b7280; font-size:13px;">Price: <strong>${esc(price.toLocaleString('vi-VN'))} VNĐ</strong></p>

                <hr style="border:none; border-top:1px solid #eee; margin:18px 0" />

                <p style="margin:16px 0; color:#6b7280; font-size:13px;">Dealer: <strong>${esc(dealerName)}</strong> — ${esc(dealerPhone)}</p>

                <p style="margin:18px 0 0 0; color:#6b7280; font-size:13px;">We will contact you soon to confirm availability and next steps.</p>

                <p style="margin:16px 0;">
                  <a href="${baseUrl}tracking" style="display:inline-block; background:#f7c50c; color:#fff; text-decoration:none; padding:10px 14px; border-radius:4px; font-weight:600;">Track your booking</a>
                </p>

                <p style="margin:18px 0 0 0; color:#6b7280; font-size:13px;">Any questions are welcome,<br/>Yours faithfully,<br/>RentNRide Support</p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 24px; font-size:12px; color:#9aa0a6; background:#fafafa;">
                RentNRide, Keangnam Landmark 72, Me tri, Nam Tu Liem, Ha Noi, +1 234 567 890
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

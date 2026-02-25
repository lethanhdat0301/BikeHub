export interface DealerBookingNotificationOptions {
  baseUrl?: string;
  dealerName: string;
  bookingCode: string;
  customerName: string;
  customerContact?: string | null;
  bikeModel?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  pickupLocation?: string | null;
  estimatedPrice?: number | null;
  status: string; // 'ASSIGNED' | 'APPROVED'
  logoSrc?: string;
}

export function buildDealerBookingNotificationHtml(opts: DealerBookingNotificationOptions): string {
  const {
    baseUrl = '/',
    dealerName,
    bookingCode,
    customerName,
    customerContact = '',
    bikeModel = '',
    startDate = '',
    endDate = '',
    pickupLocation = '',
    estimatedPrice = null,
    status,
    logoSrc = 'cid:logo',
  } = opts;

  const esc = (s: any) =>
    (s === null || s === undefined ? '' : String(s))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const isApproved = status === 'APPROVED';
  const headerColor = isApproved ? '#16a34a' : '#2563eb';
  const badgeBg = isApproved ? '#dcfce7' : '#dbeafe';
  const badgeColor = isApproved ? '#15803d' : '#1d4ed8';
  const badgeText = isApproved ? 'BOOKING APPROVED' : 'BOOKING ASSIGNED TO YOU';
  const headline = isApproved
    ? `A booking has been approved and assigned to you.`
    : `Admin has assigned a new booking request to you.`;

  const priceRow =
    estimatedPrice !== null
      ? `<tr>
          <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #f0f0f0;">Estimated Price</td>
          <td style="padding:8px 0; font-size:14px; font-weight:600; text-align:right; border-bottom:1px solid #f0f0f0;">${esc(
        estimatedPrice.toLocaleString('vi-VN')
      )} VND</td>
        </tr>`
      : '';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Booking Notification – RentNRide</title>
  </head>
  <body style="font-family: Arial,'Helvetica Neue',Helvetica,sans-serif; color:#2b2b2b; margin:0; padding:0; background:#f5f7fb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb; padding:30px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellpadding="0" cellspacing="0"
            style="background:#fff; border-radius:6px; overflow:hidden; box-shadow:0 2px 6px rgba(16,24,40,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:${headerColor}; padding:18px 24px;">
                <img src="${esc(logoSrc)}" alt="logo" style="height:38px; width:auto; margin-right:12px; vertical-align:middle;" />
                <span style="color:#fff; font-weight:700; font-size:18px; vertical-align:middle;">RentNRide</span>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 24px 24px;">
                <!-- Badge -->
                <div style="display:inline-block; background:${badgeBg}; color:${badgeColor}; font-size:12px; font-weight:700; letter-spacing:0.5px; padding:4px 12px; border-radius:99px; margin-bottom:16px;">
                  ${badgeText}
                </div>

                <h2 style="margin:0 0 8px; font-size:20px; font-weight:700; color:#111827;">Hello, ${esc(dealerName)}!</h2>
                <p style="margin:0 0 24px; font-size:15px; color:#4b5563;">${headline}</p>

                <!-- Booking details card -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:0;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #f0f0f0;">Booking Code</td>
                          <td style="padding:8px 0; font-size:14px; font-weight:700; text-align:right; border-bottom:1px solid #f0f0f0; color:#2563eb;">${esc(bookingCode)}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #f0f0f0;">Customer</td>
                          <td style="padding:8px 0; font-size:14px; font-weight:600; text-align:right; border-bottom:1px solid #f0f0f0;">${esc(customerName)}</td>
                        </tr>
                        ${customerContact
      ? `<tr>
                            <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #f0f0f0;">Contact</td>
                            <td style="padding:8px 0; font-size:14px; text-align:right; border-bottom:1px solid #f0f0f0;">${esc(customerContact)}</td>
                          </tr>`
      : ''
    }
                        ${bikeModel
      ? `<tr>
                            <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #f0f0f0;">Motorbike</td>
                            <td style="padding:8px 0; font-size:14px; font-weight:600; text-align:right; border-bottom:1px solid #f0f0f0;">${esc(bikeModel)}</td>
                          </tr>`
      : ''
    }
                        ${startDate
      ? `<tr>
                            <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #f0f0f0;">Start Date</td>
                            <td style="padding:8px 0; font-size:14px; text-align:right; border-bottom:1px solid #f0f0f0;">${esc(startDate)}</td>
                          </tr>`
      : ''
    }
                        ${endDate
      ? `<tr>
                            <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #f0f0f0;">End Date</td>
                            <td style="padding:8px 0; font-size:14px; text-align:right; border-bottom:1px solid #f0f0f0;">${esc(endDate)}</td>
                          </tr>`
      : ''
    }
                        ${pickupLocation
      ? `<tr>
                            <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #f0f0f0;">Pickup Location</td>
                            <td style="padding:8px 0; font-size:14px; text-align:right; border-bottom:1px solid #f0f0f0;">${esc(pickupLocation)}</td>
                          </tr>`
      : ''
    }
                        ${priceRow}
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0; font-size:14px; color:#6b7280;">
                  Please log in to the dealer portal to view the full booking details and prepare the motorbike for the customer.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; padding:16px 24px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
                © RentNRide &nbsp;·&nbsp; This is an automated notification, please do not reply to this email.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

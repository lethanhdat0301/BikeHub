export function generateBookingCode(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(100000 + Math.random() * 900000);
    return `BK${month}${random}`;
}
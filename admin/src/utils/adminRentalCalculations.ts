/**
 * Admin utility functions for rental calculations
 */

export interface AdminRentalPeriod {
    days: number;
    hours: number;
    isHourlyRental: boolean;
    displayText: string;
}

/**
 * Calculate rental period for admin display
 * @param startTime Start datetime string
 * @param endTime End datetime string  
 * @returns AdminRentalPeriod object
 */
export function calculateAdminRentalPeriod(
    startTime: string,
    endTime: string
): AdminRentalPeriod {
    if (!startTime || !endTime) {
        return {
            days: 0,
            hours: 0,
            isHourlyRental: false,
            displayText: "Invalid dates"
        };
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check if it's same day
    const startDate = start.toDateString();
    const endDate = end.toDateString();

    if (startDate === endDate) {
        // Same day rental
        const timeDiffMs = end.getTime() - start.getTime();
        const hours = Math.ceil(timeDiffMs / (1000 * 60 * 60));

        if (hours <= 0) {
            return {
                days: 0,
                hours: 0,
                isHourlyRental: false,
                displayText: "Invalid time"
            };
        }

        if (hours > 3) {
            return {
                days: 1,
                hours: hours,
                isHourlyRental: false,
                displayText: `Same day (${hours}h) → 1 day`
            };
        }

        return {
            days: 0,
            hours: hours,
            isHourlyRental: true,
            displayText: `${hours}h (hourly)`
        };
    }

    // Multi-day rental
    const timeDiffMs = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24));

    return {
        days: days,
        hours: 0,
        isHourlyRental: false,
        displayText: `${days} day${days > 1 ? 's' : ''}`
    };
}

/**
 * Format price display for admin
 * @param price Price amount
 * @param period Rental period info
 * @returns Formatted price string
 */
export function formatAdminPriceDisplay(price: number, period: AdminRentalPeriod): string {
    if (period.isHourlyRental) {
        const perHour = Math.ceil(price / period.hours);
        return `${price.toLocaleString('vi-VN')} VNĐ (${perHour.toLocaleString('vi-VN')} VNĐ/h)`;
    }

    if (period.days > 0) {
        const perDay = Math.ceil(price / period.days);
        return `${price.toLocaleString('vi-VN')} VNĐ (${perDay.toLocaleString('vi-VN')} VNĐ/day)`;
    }

    return `${price.toLocaleString('vi-VN')} VNĐ`;
}
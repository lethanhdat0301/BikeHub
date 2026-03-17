/**
 * Utility functions for rental calculations
 */

export interface RentalPeriod {
    days: number;
    hours: number;
    isHourlyRental: boolean;
    displayText: string;
}

/**
 * Calculate rental period between start and end dates
 * @param startDate Start date string (YYYY-MM-DD)
 * @param endDate End date string (YYYY-MM-DD)
 * @param startTime Optional start time (HH:MM)
 * @param endTime Optional end time (HH:MM)
 * @returns RentalPeriod object with calculation details
 */
export function calculateRentalPeriod(
    startDate: string,
    endDate: string,
    startTime?: string,
    endTime?: string
): RentalPeriod {
    if (!startDate || !endDate) {
        return {
            days: 0,
            hours: 0,
            isHourlyRental: false,
            displayText: "Please select dates"
        };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // If same day, calculate hours
    if (startDate === endDate && startTime && endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startDateTime = new Date(start);
        startDateTime.setHours(startHour, startMinute, 0, 0);

        const endDateTime = new Date(end);
        endDateTime.setHours(endHour, endMinute, 0, 0);

        const timeDiffMs = endDateTime.getTime() - startDateTime.getTime();
        const hours = Math.ceil(timeDiffMs / (1000 * 60 * 60));

        if (hours <= 0) {
            return {
                days: 0,
                hours: 0,
                isHourlyRental: false,
                displayText: "Invalid time range"
            };
        }

        // If more than 3 hours on same day, charge as 1 day
        if (hours > 3) {
            return {
                days: 1,
                hours: hours,
                isHourlyRental: false,
                displayText: `Same day rental (${hours}h) - charged as 1 day`
            };
        }

        return {
            days: 0,
            hours: hours,
            isHourlyRental: true,
            displayText: `${hours} hour${hours > 1 ? 's' : ''}`
        };
    }

    // Multi-day rental
    const timeDiffMs = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) {
        return {
            days: 0,
            hours: 0,
            isHourlyRental: false,
            displayText: "Invalid date range"
        };
    }

    return {
        days: days,
        hours: 0,
        isHourlyRental: false,
        displayText: `${days} day${days > 1 ? 's' : ''}`
    };
}

/**
 * Calculate rental price based on period and bike price
 * @param period RentalPeriod from calculateRentalPeriod
 * @param dailyPrice Bike price per day
 * @param hourlyRate Optional hourly rate (defaults to daily price / 8)
 * @returns Total price
 */
export function calculateRentalPrice(
    period: RentalPeriod,
    dailyPrice: number,
    hourlyRate?: number
): number {
    if (period.days === 0 && period.hours === 0) {
        return 0;
    }

    // For same day rentals over 3 hours, charge full day
    if (period.isHourlyRental === false && period.days === 1 && period.hours > 3) {
        return dailyPrice;
    }

    // For hourly rentals (3 hours or less same day)
    if (period.isHourlyRental && period.hours > 0) {
        const effectiveHourlyRate = hourlyRate || (dailyPrice / 8); // Default: daily rate divided by 8 hours
        return period.hours * effectiveHourlyRate;
    }

    // For multi-day rentals
    if (period.days > 0) {
        return period.days * dailyPrice;
    }

    return 0;
}

/**
 * Calculate discount based on rental days
 * @param days Number of rental days
 * @returns Discount percentage (0.0 to 1.0)
 */
export function calculateDiscount(days: number): number {
    if (days >= 30) return 0.20; // 20% discount for 30+ days
    if (days >= 7) return 0.10;  // 10% discount for 7+ days
    return 0; // No discount for less than 7 days
}
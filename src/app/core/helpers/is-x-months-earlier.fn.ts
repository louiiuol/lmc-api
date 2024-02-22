import {resetTime} from './reset-time.fn';

/**
 * Checks if given Date is X months earlier from now.
 * @param closedAt Date to be compared
 * @param months count of months to go back in time. Default to 1
 * @returns True if the date is X months earlier from now, False otherwise
 */
export const isXMonthEarlier = (closedAt: Date, months = 1): boolean => {
	const xMonthAgo = new Date();
	xMonthAgo.setMonth(xMonthAgo.getMonth() - months);
	resetTime(xMonthAgo); // Reset hours, minutes, seconds
	resetTime(closedAt);
	return closedAt.getTime() === xMonthAgo.getTime();
};

/**
 * Sets the hours, minutes, seconds, and milliseconds to zero on given. This ensures that only the day, month, and year are considered in the comparison.
 * @param date
 */
export const resetTime = (date: Date): void => {
	date.setHours(0, 0, 0, 0);
};

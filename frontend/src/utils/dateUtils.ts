/**
 * Formats a date string (ISO) to a local date string (DD/MM/YYYY).
 * Uses the user's local timezone.
 * @param dateStr ISO date string (e.g., '2023-10-25T14:30:00.000Z')
 * @returns Formatted date string (e.g., '25/10/2023') or empty string if invalid.
 */
export const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        // Check if date is valid
        if (isNaN(date.getTime())) return '';

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Formats a date string to local date and time.
 * @param dateStr ISO date string
 * @returns Formatted string (e.g., '25/10/2023 14:30')
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';

        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '';
    }
};

/**
 * Returns the current date in YYYY-MM-DD format (local time),
 * suitable for HTML input[type="date"] value.
 */
export const getTodayForInput = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

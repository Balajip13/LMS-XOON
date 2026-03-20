/**
 * Currency formatting utilities for INR
 */

/**
 * Formats a number as Indian Rupees
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatINR = (amount, options = {}) => {
    const {
        showDecimals = false,
        compact = false
    } = options;

    if (amount === null || amount === undefined || isNaN(amount)) {
        return '₹0';
    }

    const numAmount = Number(amount);

    if (compact) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            notation: 'compact'
        }).format(numAmount);
    }

    const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: showDecimals ? 2 : 0,
        maximumFractionDigits: showDecimals ? 2 : 0
    }).format(numAmount);

    // Remove .00 if showDecimals is false
    return showDecimals ? formatted : formatted.replace('.00', '');
};

/**
 * Formats price with discount display
 * @param {number} price - Current price
 * @param {number} originalPrice - Original price
 * @returns {Object} - Formatted prices object
 */
export const formatPriceWithDiscount = (price, originalPrice) => {
    const currentPrice = formatINR(price);
    const strikePrice = originalPrice > price ? formatINR(originalPrice) : null;
    
    return {
        currentPrice,
        strikePrice,
        hasDiscount: originalPrice > price
    };
};

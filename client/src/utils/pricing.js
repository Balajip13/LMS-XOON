/**
 * Formats pricing data consistency across the app.
 * @param {Object} course - The course object containing price, originalPrice, and discountPercentage
 * @returns {Object} - Formatted pricing data
 */
export const getPricingData = (course) => {
    if (!course) return { hasDiscount: false, displayPrice: 'Free' };

    const price = Number(course.price) || 0;
    const discountPercent = Number(course.discountPercentage) || 0;
    const discountAmount = Number(course.discount) || 0;

    // Explicit originalPrice or fall back to price
    let originalPrice = Number(course.originalPrice) || price;

    // Determine the intended final price
    let finalPrice = price;
    let hasDiscount = false;

    // 1. Check if ANY discount signal exists
    if (discountPercent > 0) {
        // If discount % is set, we calculate final price from originalPrice
        finalPrice = Math.round(originalPrice * (1 - discountPercent / 100));
        hasDiscount = true;
    } else if (discountAmount > 0) {
        // If flat discount is set
        finalPrice = Math.max(0, originalPrice - discountAmount);
        hasDiscount = true;
    } else if (originalPrice > price) {
        // Fallback for when originalPrice is simply higher than price field
        finalPrice = price;
        hasDiscount = true;
    }

    // 2. Critical Rule Fix: If hasDiscount is true but UI would hide it (originalPrice == finalPrice)
    // We MUST show a strike-through. We infer an originalPrice if they are equal.
    if (hasDiscount && originalPrice <= finalPrice) {
        const targetDiscount = discountPercent || 20; // Default to 20% if we just have a flag
        originalPrice = Math.round(finalPrice / (1 - targetDiscount / 100));

        // Round to nearest 99 or 49 for marketing look
        if (originalPrice % 100 < 50) {
            originalPrice = Math.floor(originalPrice / 100) * 100 + 49;
        } else {
            originalPrice = Math.floor(originalPrice / 100) * 100 + 99;
        }
    }

    return {
        hasDiscount,
        originalPrice,
        finalPrice,
        discountPercentage: discountPercent || Math.round(((originalPrice - finalPrice) / originalPrice) * 100),
        displayPrice: finalPrice === 0 ? 'Free' : `₹${finalPrice.toLocaleString('en-IN')}`,
        displayOriginalPrice: `₹${originalPrice.toLocaleString('en-IN')}`
    };
};

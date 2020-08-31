/**
 * Generate today date in YYYY-MM-DD based on browser local timezone
 * @returns {String} YYYY-MM-DD
 */
const getDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${(today.getDate()).toString().padStart(2, "0")}`;
};

export { getDate };

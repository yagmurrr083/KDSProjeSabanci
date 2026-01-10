/**
 * Para değerini formatlar (Milyon TL)
 * @param {number} value - TL değeri
 * @returns {string} - Formatlanmış değer
 */
function formatMoney(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }
    // Milyon'a çevir
    const millions = value / 1_000_000;
    return millions.toFixed(2) + 'M TL';
}

/**
 * Yüzdelik değeri formatlar
 * @param {number} value - Yüzdelik değer (0-100 arası)
 * @returns {string} - Formatlanmış değer
 */
function formatPercent(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }
    return value.toFixed(1) + '%';
}

/**
 * Para değerini maksimum limite sınırlar
 * @param {number} value - TL değeri
 * @param {number} max - Maksimum limit (varsayılan: 999M)
 * @returns {number} - Sınırlandırılmış değer
 */
function clampMoney(value, max = 999_000_000) {
    if (value === null || value === undefined || isNaN(value)) {
        return 0;
    }
    return Math.min(Math.max(0, value), max);
}

/**
 * Sayısal değer olup olmadığını kontrol eder
 * @param {any} value - Kontrol edilecek değer
 * @returns {boolean}
 */
function isValidNumber(value) {
    return value !== null && value !== undefined && !isNaN(Number(value));
}

/**
 * Pozitif tam sayı olup olmadığını kontrol eder
 * @param {any} value - Kontrol edilecek değer
 * @returns {boolean}
 */
function isPositiveInteger(value) {
    const num = Number(value);
    return isValidNumber(value) && Number.isInteger(num) && num > 0;
}

module.exports = {
    formatMoney,
    formatPercent,
    clampMoney,
    isValidNumber,
    isPositiveInteger
};

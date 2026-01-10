const { getSupabase } = require('../db/supabase_connect');

/**
 * Tüm firmaları geri dönüşüm verileriyle birlikte getirir
 * @returns {Promise<Array>} - Firma listesi
 */
async function getFirmsWithRecycling() {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('firmalar')
        .select('id, ad, atik_miktari, geri_donusum_orani');

    if (error) throw error;
    return data || [];
}

/**
 * En iyi 10 geri dönüşüm oranını getirir
 * @returns {Promise<Object>} - Chart data {labels, values, firms}
 */
async function getTop10Recycling() {
    const firms = await getFirmsWithRecycling();

    // Geri dönüşüm oranına göre sırala ve en iyi 10'u al
    const sorted = firms
        .filter(f => f.geri_donusum_orani > 0)
        .sort((a, b) => b.geri_donusum_orani - a.geri_donusum_orani)
        .slice(0, 10);

    return {
        labels: sorted.map(f => f.ad),
        values: sorted.map(f => f.geri_donusum_orani),
        firms: sorted
    };
}

module.exports = { getTop10Recycling, getFirmsWithRecycling };

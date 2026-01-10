const { getSupabase } = require('../db/supabase_connect');

/**
 * Tüm girişimcileri getirir
 * @returns {Promise<Array>} - Girişimci listesi
 */
async function getAllGirisimciler() {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('girisimciler')
        .select('id, isletme_adi, kadin_calisan_orani, engelli_calisan_orani, kurulus_yili');

    if (error) throw error;
    return data || [];
}

/**
 * Girişimci skorunu hesaplar
 * @param {Object} girisimci - Girişimci verisi
 * @param {Object} params - DSS parametreleri {refKadin, refEngelli, refMinYil}
 * @returns {number} - Hesaplanan skor
 */
function calculateEntrepreneurScore(girisimci, params) {
    const { refKadin, refEngelli, refMinYil } = params;

    // Kadın çalışan oranı skoru (max 40 puan)
    const kadinScore = Math.min(40, (girisimci.kadin_calisan_orani / refKadin) * 40);

    // Engelli çalışan oranı skoru (max 30 puan)
    const engelliScore = Math.min(30, (girisimci.engelli_calisan_orani / refEngelli) * 30);

    // Kuruluş yılı skoru (max 30 puan) - yeni kurulmuşlarsa daha yüksek puan
    const currentYear = new Date().getFullYear();
    const age = currentYear - girisimci.kurulus_yili;
    const maxAge = currentYear - refMinYil;
    const yilScore = maxAge > 0 ? Math.min(30, ((maxAge - age) / maxAge) * 30) : 0;

    return Math.max(0, kadinScore + engelliScore + yilScore);
}

/**
 * En iyi 10 girişimci skorunu getirir
 * @param {Object} params - DSS parametreleri
 * @returns {Promise<Object>} - Chart data {labels, values, girisimciler, parameters}
 */
async function getTop10Entrepreneurs(params) {
    const girisimciler = await getAllGirisimciler();

    // Skor hesapla
    const scored = girisimciler.map(g => ({
        ...g,
        skor: calculateEntrepreneurScore(g, params)
    }));

    // Skora göre sırala ve en iyi 10'u al
    const sorted = scored
        .filter(g => g.skor > 0)
        .sort((a, b) => b.skor - a.skor)
        .slice(0, 10);

    return {
        labels: sorted.map(g => g.isletme_adi),
        values: sorted.map(g => g.skor),
        girisimciler: sorted,
        parameters: params
    };
}

module.exports = { getTop10Entrepreneurs, getAllGirisimciler, calculateEntrepreneurScore };

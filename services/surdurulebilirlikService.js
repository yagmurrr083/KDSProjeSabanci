const { getSupabase } = require('../db/supabase_connect');

/**
 * Tüm firmaları sürdürülebilirlik puanlarıyla birlikte getirir
 * @returns {Promise<Array>} - Firma listesi
 */
async function getFirmsWithSustainability() {
    const supabase = getSupabase();

    // Tüm firmaları getir
    const { data: firmalar, error: firmalarError } = await supabase
        .from('firmalar')
        .select('id, ad');

    if (firmalarError) throw firmalarError;
    if (!firmalar || firmalar.length === 0) return [];

    // Tüm tahminleme kayıtlarını getir
    const { data: tahminlemeler, error: tahminError } = await supabase
        .from('firma_tahminleme')
        .select('firma_id, surdurulebilirlik_uyum_puani, olusturulma_tarihi')
        .order('olusturulma_tarihi', { ascending: false });

    if (tahminError) throw tahminError;

    // Her firma için en son kaydı bul
    const latestByFirma = {};
    if (tahminlemeler && Array.isArray(tahminlemeler)) {
        for (const t of tahminlemeler) {
            if (t && t.firma_id && !latestByFirma[t.firma_id]) {
                latestByFirma[t.firma_id] = t;
            }
        }
    }

    return firmalar.map(firma => ({
        ...firma,
        surdurulebilirlik_uyum_puani: latestByFirma[firma.id]?.surdurulebilirlik_uyum_puani || 0
    }));
}

/**
 * En iyi 7 sürdürülebilirlik puanını getirir
 * @returns {Promise<Object>} - Chart data {labels, values, firms}
 */
async function getTop7Sustainability() {
    const firms = await getFirmsWithSustainability();

    // Puana göre sırala ve en iyi 7'yi al
    const sorted = firms
        .filter(f => f.surdurulebilirlik_uyum_puani > 0)
        .sort((a, b) => b.surdurulebilirlik_uyum_puani - a.surdurulebilirlik_uyum_puani)
        .slice(0, 7);

    return {
        labels: sorted.map(f => f.ad),
        values: sorted.map(f => f.surdurulebilirlik_uyum_puani),
        firms: sorted
    };
}

module.exports = { getTop7Sustainability, getFirmsWithSustainability };

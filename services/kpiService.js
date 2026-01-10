const { getSupabase } = require('../db/supabase_connect');
const { clampMoney } = require('../utils/formatting');

// Maksimum para değeri (999M TL)
const MAX_MONEY_TL = 999_000_000;

/**
 * Ayarları getirir
 * @returns {Promise<Object>} - Ayarlar {butce_yuzdesi, karbon_esik}
 */
async function getAyarlar() {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('ayarlar')
        .select('*')
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { butce_yuzdesi: 0.72, karbon_esik: 5000 };
}

/**
 * Firma için en son tahminleme kaydını getirir
 * @param {number} firmaId - Firma ID
 * @returns {Promise<Object|null>} - Tahminleme kaydı
 */
async function getLatestTahminleme(firmaId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('firma_tahminleme')
        .select('*')
        .eq('firma_id', firmaId)
        .order('olusturulma_tarihi', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
}

/**
 * Seçili firma için KPI verilerini hesaplar
 * @param {number|null} firmaId - Firma ID (opsiyonel)
 * @returns {Promise<Object>} - KPI verileri
 */
async function getKpisForFirm(firmaId) {
    // Ayarları getir
    let ayarlar = { butce_yuzdesi: 0.72 };
    try {
        ayarlar = await getAyarlar();
    } catch (e) {
        console.error('[kpiService] Ayarlar getirme hatası:', e);
    }
    const butceYuzdesi = ayarlar?.butce_yuzdesi || 0.72;

    if (!firmaId) {
        return {
            tahminiGetiri: 0,
            kadinGirisimciBütcesi: 0,
            firmaAdi: null,
            butceYuzdesi,
            hesapKontrol: false
        };
    }

    // Firma bilgilerini getir
    const { getFirmById } = require('./firmalarService');
    let firma = null;
    try {
        firma = await getFirmById(firmaId);
    } catch (e) {
        console.error('[kpiService] Firma getirme hatası:', e);
    }

    if (!firma) {
        return {
            tahminiGetiri: 0,
            kadinGirisimciBütcesi: 0,
            firmaAdi: null,
            butceYuzdesi,
            hesapKontrol: false
        };
    }

    // En son tahminleme kaydını getir
    let tahminiGetiri = 0;
    try {
        const tahminleme = await getLatestTahminleme(firmaId);
        if (tahminleme) {
            tahminiGetiri = clampMoney(tahminleme.tahmini_getiri || 0, MAX_MONEY_TL);
        }
    } catch (e) {
        console.error('[kpiService] Tahminleme getirme hatası:', e);
        tahminiGetiri = 0;
    }

    // Kadın Girişimci Bütçesi hesaplama
    const kadinGirisimciBütcesi = clampMoney(tahminiGetiri * butceYuzdesi, MAX_MONEY_TL);

    // Hesap kontrolü
    const hesapKontrol = (
        kadinGirisimciBütcesi > tahminiGetiri ||
        isNaN(kadinGirisimciBütcesi) ||
        isNaN(tahminiGetiri)
    );

    return {
        tahminiGetiri,
        kadinGirisimciBütcesi,
        firmaAdi: firma.ad || null,
        butceYuzdesi,
        hesapKontrol
    };
}

/**
 * Tüm firmaların getiri verilerini getirir (line chart için)
 * @returns {Promise<Object>} - Tüm firma getiri verileri
 */
async function getAllReturns() {
    const supabase = getSupabase();

    // Ayarları getir
    let ayarlar = { butce_yuzdesi: 0.72 };
    try {
        ayarlar = await getAyarlar();
    } catch (e) {
        console.error('[kpiService] Ayarlar getirme hatası:', e);
    }
    const butceYuzdesi = ayarlar?.butce_yuzdesi || 0.72;

    // Tüm firmaları getir
    const { data: firmalar, error: firmalarError } = await supabase
        .from('firmalar')
        .select('id, ad');

    if (firmalarError) throw firmalarError;
    if (!firmalar || firmalar.length === 0) {
        return { firms: [], butceYuzdesi };
    }

    // Tüm tahminleme kayıtlarını getir
    const { data: tahminlemeler, error: tahminError } = await supabase
        .from('firma_tahminleme')
        .select('firma_id, tahmini_getiri, olusturulma_tarihi')
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

    // Firma verilerini hazırla
    const firms = firmalar.map(firma => {
        const tahminleme = latestByFirma[firma.id];
        const tahminiGetiri = clampMoney(tahminleme?.tahmini_getiri || 0, MAX_MONEY_TL);
        const kadinGirisimciBütcesi = clampMoney(tahminiGetiri * butceYuzdesi, MAX_MONEY_TL);

        return {
            id: firma.id,
            ad: firma.ad,
            tahminiGetiri,
            kadinGirisimciBütcesi
        };
    });

    return { firms, butceYuzdesi };
}

module.exports = { getKpisForFirm, getAllReturns, getAyarlar, getLatestTahminleme };

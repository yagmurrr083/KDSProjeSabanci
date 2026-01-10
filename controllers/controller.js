/**
 * Controller - Tüm API endpoint'leri için controller fonksiyonları
 * Eğitmen formatına uygun olarak tüm controller'lar bu dosyada export edilir
 */

const { getAllFirms, getFirmById } = require('../services/firmalarService');
const { getKpisForFirm, getAllReturns } = require('../services/kpiService');
const { getTop7Sustainability } = require('../services/surdurulebilirlikService');
const { getTop10Recycling } = require('../services/geriDonusumService');
const { getTop10Entrepreneurs } = require('../services/girisimciService');
const { NotFoundError } = require('../utils/errors');

/**
 * Sağlık kontrolü endpoint'i
 * GET /api/health
 */
const health_getir = async (req, res) => {
    try {
        return res.status(200).json({
            ok: true,
            hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
            hasSupabaseAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
            now: new Date().toISOString()
        });
    } catch (err) {
        console.error('[health_getir] Hata:', err);
        return res.status(500).json({ ok: false, error: 'Sunucu hatası' });
    }
};

/**
 * Firma listesi endpoint'i
 * GET /api/firms
 */
const firmalar_getir = async (req, res) => {
    try {
        const firms = await getAllFirms();
        return res.status(200).json({
            ok: true,
            data: firms || []
        });
    } catch (err) {
        console.error('[firmalar_getir] Hata:', err);
        return res.status(500).json({
            ok: false,
            error: err.message || 'Firmalar yüklenirken hata oluştu',
            where: '/api/firms'
        });
    }
};

/**
 * KPI verileri endpoint'i
 * GET /api/dashboard/kpis?firma_id=X
 */
const kpiler_getir = async (req, res) => {
    try {
        const firmaId = req.validatedFirmaId || null;

        // Firma ID varsa, var olup olmadığını kontrol et
        if (firmaId) {
            const firma = await getFirmById(firmaId);
            if (!firma) {
                throw new NotFoundError('Firma bulunamadı');
            }
        }

        const kpis = await getKpisForFirm(firmaId);
        return res.status(200).json({
            ok: true,
            data: kpis || { tahminiGetiri: 0, kadinGirisimciBütcesi: 0, firmaAdi: null }
        });
    } catch (err) {
        if (err instanceof NotFoundError) {
            return res.status(404).json({
                ok: false,
                error: err.message,
                where: '/api/dashboard/kpis'
            });
        }
        console.error('[kpiler_getir] Hata:', err);
        return res.status(500).json({
            ok: false,
            error: err.message || 'KPI verileri yüklenirken hata oluştu',
            where: '/api/dashboard/kpis'
        });
    }
};

/**
 * Tüm getiriler endpoint'i
 * GET /api/dashboard/all-returns
 */
const tum_getiriler_getir = async (req, res) => {
    try {
        const data = await getAllReturns();
        return res.status(200).json({
            ok: true,
            data: data || { firms: [], butceYuzdesi: 0.72 }
        });
    } catch (err) {
        console.error('[tum_getiriler_getir] Hata:', err);
        return res.status(500).json({
            ok: false,
            error: err.message || 'Getiri verileri yüklenirken hata oluştu',
            where: '/api/dashboard/all-returns'
        });
    }
};

/**
 * Sürdürülebilirlik Top 7 endpoint'i
 * GET /api/dashboard/sustainability-top7
 */
const surdurulebilirlik_getir = async (req, res) => {
    try {
        const data = await getTop7Sustainability();
        return res.status(200).json({
            ok: true,
            data: data || { labels: [], values: [], firms: [] }
        });
    } catch (err) {
        console.error('[surdurulebilirlik_getir] Hata:', err);
        return res.status(500).json({
            ok: false,
            error: err.message || 'Sürdürülebilirlik verileri yüklenirken hata oluştu',
            where: '/api/dashboard/sustainability-top7'
        });
    }
};

/**
 * Geri Dönüşüm Top 10 endpoint'i
 * GET /api/dashboard/recycling-top10
 */
const geri_donusum_getir = async (req, res) => {
    try {
        const data = await getTop10Recycling();
        return res.status(200).json({
            ok: true,
            data: data || { labels: [], values: [], firms: [] }
        });
    } catch (err) {
        console.error('[geri_donusum_getir] Hata:', err);
        return res.status(500).json({
            ok: false,
            error: err.message || 'Geri dönüşüm verileri yüklenirken hata oluştu',
            where: '/api/dashboard/recycling-top10'
        });
    }
};

/**
 * Girişimci Top 10 endpoint'i
 * GET /api/dashboard/entrepreneur-top10?ref_kadin=X&ref_engelli=Y&ref_min_yil=Z
 */
const girisimci_getir = async (req, res) => {
    try {
        const params = req.dssParams || { refKadin: 30, refEngelli: 5, refMinYil: 2015 };
        const data = await getTop10Entrepreneurs(params);
        return res.status(200).json({
            ok: true,
            data: data || { labels: [], values: [], girisimciler: [], parameters: {} }
        });
    } catch (err) {
        console.error('[girisimci_getir] Hata:', err);
        return res.status(500).json({
            ok: false,
            error: err.message || 'Girişimci verileri yüklenirken hata oluştu',
            where: '/api/dashboard/entrepreneur-top10'
        });
    }
};

module.exports = {
    health_getir,
    firmalar_getir,
    kpiler_getir,
    tum_getiriler_getir,
    surdurulebilirlik_getir,
    geri_donusum_getir,
    girisimci_getir
};

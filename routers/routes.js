const router = require('express').Router();

// Controller import
const {
    health_getir,
    firmalar_getir,
    kpiler_getir,
    tum_getiriler_getir,
    surdurulebilirlik_getir,
    geri_donusum_getir,
    girisimci_getir
} = require('../controllers/controller');

// Validation middleware'leri
const { validateFirmaId, validateDssParams } = require('../middlewares/validations/validation');

// ============================================
// API Route Tanımları
// ============================================

// Sağlık kontrolü
// GET /api/health
router.get('/health', health_getir);

// Firma listesi
// GET /api/firms
router.get('/firms', firmalar_getir);

// KPI verileri (firma bazlı)
// GET /api/dashboard/kpis?firma_id=X
router.get('/dashboard/kpis', validateFirmaId, kpiler_getir);

// Tüm firmaların getiri verileri
// GET /api/dashboard/all-returns
router.get('/dashboard/all-returns', tum_getiriler_getir);

// Sürdürülebilirlik Top 7
// GET /api/dashboard/sustainability-top7
router.get('/dashboard/sustainability-top7', surdurulebilirlik_getir);

// Geri Dönüşüm Top 10
// GET /api/dashboard/recycling-top10
router.get('/dashboard/recycling-top10', geri_donusum_getir);

// Girişimci Top 10 (DSS parametreleri ile)
// GET /api/dashboard/entrepreneur-top10?ref_kadin=X&ref_engelli=Y&ref_min_yil=Z
router.get('/dashboard/entrepreneur-top10', validateDssParams, girisimci_getir);

module.exports = router;

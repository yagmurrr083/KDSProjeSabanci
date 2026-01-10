const { ValidationError } = require('../../utils/errors');
const { isPositiveInteger, isValidNumber } = require('../../utils/formatting');

/**
 * Firma ID doğrulama middleware'i
 * Query parametresindeki firma_id'yi doğrular
 */
const validateFirmaId = (req, res, next) => {
    const { firma_id } = req.query;

    // firma_id opsiyonel, yoksa geç
    if (!firma_id) {
        return next();
    }

    // Sayısal ve pozitif olmalı
    if (!isPositiveInteger(firma_id)) {
        return next(new ValidationError('Geçersiz firma ID'));
    }

    // Doğrulanmış değeri req'e ekle
    req.validatedFirmaId = parseInt(firma_id, 10);
    next();
};

/**
 * DSS parametre doğrulama middleware'i
 * Girişimci endpointi için parametreleri doğrular
 */
const validateDssParams = (req, res, next) => {
    const { ref_kadin, ref_engelli, ref_min_yil } = req.query;

    // Varsayılan değerler
    const params = {
        refKadin: 30,
        refEngelli: 5,
        refMinYil: 2015
    };

    // Parametre doğrulama
    if (ref_kadin !== undefined) {
        if (!isValidNumber(ref_kadin)) {
            return next(new ValidationError('Geçersiz DSS parametreleri'));
        }
        params.refKadin = parseFloat(ref_kadin);
    }

    if (ref_engelli !== undefined) {
        if (!isValidNumber(ref_engelli)) {
            return next(new ValidationError('Geçersiz DSS parametreleri'));
        }
        params.refEngelli = parseFloat(ref_engelli);
    }

    if (ref_min_yil !== undefined) {
        if (!isPositiveInteger(ref_min_yil)) {
            return next(new ValidationError('Geçersiz DSS parametreleri'));
        }
        params.refMinYil = parseInt(ref_min_yil, 10);
    }

    req.dssParams = params;
    next();
};

module.exports = { validateFirmaId, validateDssParams };

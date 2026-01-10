const { APIError } = require('../../utils/errors');

/**
 * Merkezi hata yakalama middleware'i
 * Tüm hataları yakalar ve uygun HTTP yanıtı döndürür
 */
const errorHandlerMiddleware = (err, req, res, next) => {
    // Hata loglama
    console.error(`[HATA] ${new Date().toISOString()} - ${err.name}: ${err.message}`);

    // APIError instance kontrolü
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Genel sunucu hatası
    return res.status(500).json({
        success: false,
        message: 'Bir hata ile karşılaşıldı. Lütfen API sağlayıcınızla iletişime geçin.'
    });
};

module.exports = errorHandlerMiddleware;

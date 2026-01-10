/**
 * APIError - Özel hata sınıfı
 * HTTP durum kodu ve mesaj içerir
 */
class APIError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'APIError';
    }
}

/**
 * ValidationError - Doğrulama hatası
 * 400 Bad Request döndürür
 */
class ValidationError extends APIError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

/**
 * NotFoundError - Kaynak bulunamadı hatası
 * 404 Not Found döndürür
 */
class NotFoundError extends APIError {
    constructor(message) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

module.exports = { APIError, ValidationError, NotFoundError };

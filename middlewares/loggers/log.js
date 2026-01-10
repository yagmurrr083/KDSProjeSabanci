/**
 * Request loglama middleware'i
 * Her isteği tarih, method ve URL ile loglar
 */
const loggerMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;

    console.log(`[${timestamp}] ${method} ${url}`);

    next();
};

module.exports = loggerMiddleware;

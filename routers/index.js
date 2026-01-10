const router = require('express').Router();
const routes = require('./routes');

// Tüm route'ları kullan
router.use(routes);

module.exports = router;

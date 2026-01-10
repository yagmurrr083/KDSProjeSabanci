const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Router import
const router = require('./routers');

// Middleware'ler
const errorHandler = require('./middlewares/validations/errorHandler');
const logger = require('./middlewares/loggers/log');

// CORS ayarları
app.use(cors());

// Body parser
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request loglama
app.use(logger);

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// API route'ları
// /api'ye gelen tüm istekler routers klasöründeki index.js dosyasına yönlendirilir
app.use('/api', router);

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Merkezi hata yakalama middleware'i
app.use(errorHandler);

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu port ${port} üzerinde çalışıyor...`);
});

module.exports = app;

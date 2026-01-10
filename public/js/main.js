/**
 * KDS - Karar Destek Sistemi Frontend JavaScript
 * Vanilla JavaScript ile yazılmış dashboard işlevselliği
 */

// ============================================
// Durum Yönetimi (State Management)
// ============================================
const state = {
    selectedFirmaId: null,
    dssParams: {
        refKadin: 30,
        refEngelli: 5,
        refMinYil: 2015
    },
    firms: [],
    kpis: {
        tahminiGetiri: 0,
        kadinGirisimciBütcesi: 0,
        firmaAdi: null,
        butceYuzdesi: 0.72
    },
    allReturnsData: null,
    sustainabilityData: null,
    recyclingData: null,
    entrepreneurData: null,
    charts: {}
};

// ============================================
// API Fonksiyonları
// ============================================

/**
 * Firma listesini getirir
 */
async function fetchFirms() {
    showLoading('firma-loading');
    hideError('firma-error');

    try {
        const response = await fetch('/api/firms');
        const data = await response.json();

        if (data.ok) {
            state.firms = data.data || [];
            renderFirmaDropdown();
        } else {
            showError('firma-error', data.error || 'Firmalar yüklenemedi');
        }
    } catch (error) {
        console.error('[fetchFirms] Hata:', error);
        showError('firma-error', 'Firmalar yüklenirken bağlantı hatası');
    } finally {
        hideLoading('firma-loading');
    }
}

/**
 * KPI verilerini getirir
 */
async function fetchKpis() {
    try {
        const url = state.selectedFirmaId
            ? `/api/dashboard/kpis?firma_id=${state.selectedFirmaId}`
            : '/api/dashboard/kpis';

        const response = await fetch(url);
        const data = await response.json();

        if (data.ok) {
            state.kpis = data.data || { tahminiGetiri: 0, kadinGirisimciBütcesi: 0, firmaAdi: null };
            renderKpis();
        } else {
            console.error('[fetchKpis] API hatası:', data.error);
        }
    } catch (error) {
        console.error('[fetchKpis] Hata:', error);
    }
}

/**
 * Tüm getiri verilerini getirir
 */
async function fetchAllReturns() {
    try {
        const response = await fetch('/api/dashboard/all-returns');
        const data = await response.json();

        if (data.ok) {
            state.allReturnsData = data.data || { firms: [], butceYuzdesi: 0.72 };
            renderReturnsCharts();
        } else {
            console.error('[fetchAllReturns] API hatası:', data.error);
        }
    } catch (error) {
        console.error('[fetchAllReturns] Hata:', error);
    }
}

/**
 * Sürdürülebilirlik verilerini getirir
 */
async function fetchSustainability() {
    try {
        const response = await fetch('/api/dashboard/sustainability-top7');
        const data = await response.json();

        if (data.ok) {
            state.sustainabilityData = data.data || { labels: [], values: [], firms: [] };
            renderSustainabilityChart();
        } else {
            console.error('[fetchSustainability] API hatası:', data.error);
        }
    } catch (error) {
        console.error('[fetchSustainability] Hata:', error);
    }
}

/**
 * Geri dönüşüm verilerini getirir
 */
async function fetchRecycling() {
    try {
        const response = await fetch('/api/dashboard/recycling-top10');
        const data = await response.json();

        if (data.ok) {
            state.recyclingData = data.data || { labels: [], values: [], firms: [] };
            renderRecyclingChart();
        } else {
            console.error('[fetchRecycling] API hatası:', data.error);
        }
    } catch (error) {
        console.error('[fetchRecycling] Hata:', error);
    }
}

/**
 * Girişimci verilerini getirir
 */
async function fetchEntrepreneurs() {
    try {
        const params = new URLSearchParams({
            ref_kadin: state.dssParams.refKadin.toString(),
            ref_engelli: state.dssParams.refEngelli.toString(),
            ref_min_yil: state.dssParams.refMinYil.toString()
        });

        const response = await fetch(`/api/dashboard/entrepreneur-top10?${params}`);
        const data = await response.json();

        if (data.ok) {
            state.entrepreneurData = data.data || { labels: [], values: [], girisimciler: [], parameters: {} };
            renderEntrepreneurChart();
        } else {
            console.error('[fetchEntrepreneurs] API hatası:', data.error);
        }
    } catch (error) {
        console.error('[fetchEntrepreneurs] Hata:', error);
    }
}

// ============================================
// Render Fonksiyonları
// ============================================

/**
 * Firma dropdown'ını render eder
 */
function renderFirmaDropdown() {
    const select = document.getElementById('firma-select');
    if (!select) return;

    // Mevcut seçenekleri temizle (ilk varsayılan hariç)
    select.innerHTML = '<option value="">Tüm Firmalar</option>';

    // Firmaları ekle
    state.firms.forEach(firma => {
        const option = document.createElement('option');
        option.value = firma.id;
        option.textContent = firma.ad;
        select.appendChild(option);
    });
}

/**
 * KPI kartlarını render eder
 */
function renderKpis() {
    const tahminiGetiriEl = document.getElementById('kpi-tahmini-getiri');
    const kadinButceEl = document.getElementById('kpi-kadin-butce');
    const firmaAdiEl = document.getElementById('kpi-firma-adi');
    const butceYuzdeEl = document.getElementById('kpi-butce-yuzde');

    if (tahminiGetiriEl) {
        tahminiGetiriEl.textContent = formatMoney(state.kpis.tahminiGetiri);
    }
    if (kadinButceEl) {
        kadinButceEl.textContent = formatMoney(state.kpis.kadinGirisimciBütcesi);
    }
    if (firmaAdiEl) {
        firmaAdiEl.textContent = state.kpis.firmaAdi ? `Firma: ${state.kpis.firmaAdi}` : '';
    }
    if (butceYuzdeEl) {
        const yuzde = (state.kpis.butceYuzdesi || 0.72) * 100;
        butceYuzdeEl.textContent = `Bütçe Yüzdesi: %${yuzde.toFixed(0)}`;
    }
}

/**
 * Getiri çizelgelerini render eder
 */
function renderReturnsCharts() {
    if (!state.allReturnsData || !state.allReturnsData.firms) return;

    const firms = state.allReturnsData.firms;
    const labels = firms.map(f => f.ad);
    const tahminiGetiriValues = firms.map(f => f.tahminiGetiri / 1_000_000);
    const kadinButceValues = firms.map(f => f.kadinGirisimciBütcesi / 1_000_000);

    // Tahmini Getiri Chart
    renderLineChart('chart-tahmini-getiri', labels, tahminiGetiriValues, 'Tahmini Getiri (M TL)', '#10B981');

    // Kadın Bütçe Chart
    renderLineChart('chart-kadin-butce', labels, kadinButceValues, 'Kadın Girişimci Bütçesi (M TL)', '#EC4899');
}

/**
 * Sürdürülebilirlik çizelgesini render eder
 */
function renderSustainabilityChart() {
    if (!state.sustainabilityData) return;

    renderBarChart(
        'chart-sustainability',
        state.sustainabilityData.labels,
        state.sustainabilityData.values,
        'Uyum Puanı',
        '#8B5CF6'
    );
}

/**
 * Geri dönüşüm çizelgesini render eder
 */
function renderRecyclingChart() {
    if (!state.recyclingData) return;

    renderBarChart(
        'chart-recycling',
        state.recyclingData.labels,
        state.recyclingData.values,
        'Geri Dönüşüm Oranı (%)',
        '#06B6D4'
    );
}

/**
 * Girişimci çizelgesini render eder
 */
function renderEntrepreneurChart() {
    if (!state.entrepreneurData) return;

    renderBarChart(
        'chart-entrepreneur',
        state.entrepreneurData.labels,
        state.entrepreneurData.values,
        'DSS Skoru',
        '#F59E0B'
    );
}

// ============================================
// Chart Yardımcı Fonksiyonları
// ============================================

/**
 * Çizgi grafiği oluşturur
 */
function renderLineChart(canvasId, labels, data, label, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Önceki chart'ı temizle
    if (state.charts[canvasId]) {
        state.charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    state.charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '33',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#E5E7EB' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9CA3AF', maxRotation: 45 },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                }
            }
        }
    });
}

/**
 * Çubuk grafiği oluşturur
 */
function renderBarChart(canvasId, labels, data, label, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Önceki chart'ı temizle
    if (state.charts[canvasId]) {
        state.charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    state.charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: color + 'CC',
                borderColor: color,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#E5E7EB' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9CA3AF', maxRotation: 45 },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                }
            }
        }
    });
}

// ============================================
// Yardımcı Fonksiyonlar
// ============================================

/**
 * Para formatı
 */
function formatMoney(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0 TL';
    }
    if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(2) + 'M TL';
    }
    return new Intl.NumberFormat('tr-TR').format(value) + ' TL';
}

/**
 * Loading göster
 */
function showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.remove('hidden');
        el.classList.add('loading');
    }
}

/**
 * Loading gizle
 */
function hideLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.add('hidden');
        el.classList.remove('loading');
    }
}

/**
 * Hata göster
 */
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

/**
 * Hata gizle
 */
function hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.add('hidden');
    }
}

// ============================================
// Olay Dinleyicileri (Event Listeners)
// ============================================

/**
 * Firma seçimi değiştiğinde
 */
function onFirmaChange(e) {
    const value = e.target.value;
    state.selectedFirmaId = value ? parseInt(value, 10) : null;
    fetchKpis();
}

/**
 * DSS parametrelerini güncelle
 */
function onUpdateParams() {
    const kadinInput = document.getElementById('param-kadin');
    const engelliInput = document.getElementById('param-engelli');
    const minYilInput = document.getElementById('param-min-yil');

    if (kadinInput) state.dssParams.refKadin = parseFloat(kadinInput.value) || 30;
    if (engelliInput) state.dssParams.refEngelli = parseFloat(engelliInput.value) || 5;
    if (minYilInput) state.dssParams.refMinYil = parseInt(minYilInput.value, 10) || 2015;

    fetchEntrepreneurs();
}

// ============================================
// Uygulama Başlatma
// ============================================

/**
 * Dashboard'u başlat
 */
async function initDashboard() {
    console.log('[KDS] Dashboard başlatılıyor...');

    // Event listeners ekle
    const firmaSelect = document.getElementById('firma-select');
    if (firmaSelect) {
        firmaSelect.addEventListener('change', onFirmaChange);
    }

    const updateBtn = document.getElementById('btn-update-params');
    if (updateBtn) {
        updateBtn.addEventListener('click', onUpdateParams);
    }

    // Tüm verileri paralel olarak yükle
    await Promise.all([
        fetchFirms(),
        fetchKpis(),
        fetchAllReturns(),
        fetchSustainability(),
        fetchRecycling(),
        fetchEntrepreneurs()
    ]);

    console.log('[KDS] Dashboard hazır.');
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', initDashboard);

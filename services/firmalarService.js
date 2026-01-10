const { getSupabase } = require('../db/supabase_connect');

/**
 * Tüm firmaları getirir (dropdown için)
 * @returns {Promise<Array>} - Firma listesi [{id, ad}, ...]
 */
async function getAllFirms() {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('firmalar')
        .select('id, ad')
        .order('ad', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Firma detaylarını ID'ye göre getirir
 * @param {number} firmaId - Firma ID
 * @returns {Promise<Object|null>} - Firma detayları
 */
async function getFirmById(firmaId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('firmalar')
        .select('*')
        .eq('id', firmaId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
}

module.exports = { getAllFirms, getFirmById };

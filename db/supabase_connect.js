const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let supabaseInstance = null;

/**
 * Supabase bağlantısı oluşturur ve döndürür
 * Singleton pattern kullanılarak tek bir bağlantı instance'ı tutulur
 */
function getSupabase() {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('SUPABASE_URL veya SUPABASE_ANON_KEY tanımlı değil');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
}

module.exports = { getSupabase };

import { createClient } from '@supabase/supabase-js';

// Extract Project Ref from the JWT Anon Key if URL is incorrectly provided
const extractProjectUrl = (urlOrKey: string, anonKey: string) => {
    if (urlOrKey.startsWith('http')) return urlOrKey;
    try {
        const payloadBase64 = anonKey.split('.')[1];
        if (payloadBase64) {
            const payload = JSON.parse(atob(payloadBase64));
            if (payload.ref) return `https://${payload.ref}.supabase.co`;
        }
    } catch (e) {
        console.error("Failed to parse Supabase URL", e);
    }
    return urlOrKey; // Fallback
}

const supabaseUrl = extractProjectUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'puthi-ghor-admin-auth'
    }
});

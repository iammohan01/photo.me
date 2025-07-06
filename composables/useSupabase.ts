import {createClient} from '@supabase/supabase-js'
import type {Database} from "~/types/database.types";

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const useSupabase = () => {
    const config = useRuntimeConfig()
    if (!supabaseInstance) {
        supabaseInstance = createClient<Database>(
            config.public.supabaseUrl,
            config.public.supabaseAnonKey
        )
    }
    return {
        supabase: supabaseInstance
    }
} 
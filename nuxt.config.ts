import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2025-05-15",
    devtools: {enabled: true},
    runtimeConfig: {
        public: {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        },
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    nitro: {
        preset: "cloudflare_module",

        cloudflare: {
            deployConfig: true,
            nodeCompat: true
        }
    },
    css: ['~/assets/css/tailwind.css'],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    shadcn: {
        prefix: '',
        componentDir: './components/ui'
    },
    modules: [
        "@nuxt/eslint",
        "@nuxt/fonts",
        "@nuxt/icon",
        "@nuxt/image",
        "@nuxt/ui",
        "nitro-cloudflare-dev",
        'shadcn-nuxt'
    ],
});

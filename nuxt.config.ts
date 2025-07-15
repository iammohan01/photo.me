import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

export default defineNuxtConfig({
    compatibilityDate: "2025-05-15",
    devtools: {enabled: true},
    runtimeConfig: {
        public: {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        },
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
        "shadcn-nuxt",
    ],
});

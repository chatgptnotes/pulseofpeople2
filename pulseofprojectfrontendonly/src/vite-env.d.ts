/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_REGISTRY_DB_URL?: string
  readonly VITE_REGISTRY_DB_KEY?: string
  readonly VITE_APP_URL?: string
  readonly VITE_TENANT_MODE?: string
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

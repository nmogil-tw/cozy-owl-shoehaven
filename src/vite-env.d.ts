/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly AIRTABLE_API_KEY: string
    readonly AIRTABLE_BASE_ID: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
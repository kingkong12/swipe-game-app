/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_PASSWORD: string;
    }
  }
}

// Cloudflare bindings
export interface CloudflareEnv {
  DB: D1Database;
  ADMIN_PASSWORD: string;
}

export {};

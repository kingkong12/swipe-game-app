/// <reference types="@cloudflare/workers-types" />

// Extend the global CloudflareEnv interface used by @cloudflare/next-on-pages
declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_PASSWORD?: string;
    }
  }
}

export {};

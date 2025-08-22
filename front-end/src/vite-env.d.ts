
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_ZOOM_API_KEY: string;
  readonly VITE_ZOOM_API_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
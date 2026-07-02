/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CONFIG_HOST: string;
}
interface ImportMeta {
    readonly env: ImportMetaEnv;
}

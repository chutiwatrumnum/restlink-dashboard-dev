// src/utils/config.ts

const MODE = import.meta.env.VITE_MODE as "dev" | "uat" | "prod";

const API_URL_MAP = {
  dev: import.meta.env.VITE_DEV_API_URL,
  uat: import.meta.env.VITE_UAT_API_URL,
  prod: import.meta.env.VITE_PROD_API_URL,
};

const APP_VERSION_MAP = {
  dev: import.meta.env.VITE_DEV_APP_VERSION,
  uat: import.meta.env.VITE_UAT_APP_VERSION,
  prod: import.meta.env.VITE_PROD_APP_VERSION,
};

const SOS_API_URL_MAP = {
  dev: import.meta.env.VITE_DEV_SOS_API_URL,
  uat: import.meta.env.VITE_UAT_SOS_API_URL,
  prod: import.meta.env.VITE_PROD_SOS_API_URL,
};

export const API_URL = API_URL_MAP[MODE];
export const APP_VERSION = APP_VERSION_MAP[MODE];
export const SOS_API_URL = SOS_API_URL_MAP[MODE];

export { MODE };

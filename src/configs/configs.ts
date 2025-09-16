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

const TEMPLETE_EXCEL_URL_MAP = {
  dev: {
    village: import.meta.env.VITE_DEV_VILLAGE_TEMPLATE,
    condo: import.meta.env.VITE_DEV_CONDO_TEMPLATE,
  },
  uat: {
    village: import.meta.env.VITE_UAT_VILLAGE_TEMPLATE,
    condo: import.meta.env.VITE_UAT_CONDO_TEMPLATE,
  },
  prod: {
    village: import.meta.env.VITE_PROD_VILLAGE_TEMPLATE,
    condo: import.meta.env.VITE_PROD_CONDO_TEMPLATE,
  },
};

const GOOGLE_API_KEY_MAP = {
  dev: import.meta.env.VITE_DEV_GOOGLE_API_KEY,
  uat: import.meta.env.VITE_UAT_GOOGLE_API_KEY,
  prod: import.meta.env.VITE_PROD_GOOGLE_API_KEY,
};

const SOCKET_URL_MAP = {
  dev: import.meta.env.VITE_DEV_SOCKET_URL,
  uat: import.meta.env.VITE_UAT_SOCKET_URL,
  prod: import.meta.env.VITE_PROD_SOCKET_URL,
}; 

const SOCKET_URL_SOS_MAP = {
  dev: import.meta.env.VITE_DEV_SOS_SOCKET,
  uat: import.meta.env.VITE_UAT_SOS_SOCKET,
  prod: import.meta.env.VITE_PROD_SOS_SOCKET,
}; 

export const API_URL = API_URL_MAP[MODE];
export const APP_VERSION = APP_VERSION_MAP[MODE];
export const SOS_API_URL = SOS_API_URL_MAP[MODE];
export const TEMPLETE_EXCEL_URL = TEMPLETE_EXCEL_URL_MAP[MODE];
export const NEXRES_GOOGLE_API_KEY = GOOGLE_API_KEY_MAP[MODE];
export const SOCKET_URL = SOCKET_URL_MAP[MODE];
export const SOCKET_URL_SOS = SOCKET_URL_SOS_MAP[MODE];
export { MODE };

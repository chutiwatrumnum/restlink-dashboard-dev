export const MODE = "dev"; // dev, uat

// [0] == version
// [1] == type of server
// [2] == major version
// [3] == minor version
/*
0 = DEV
1 = SIT
2 = UAT
3 = UAT.
*/
// uat
const APP_VERSION_CODE_UAT = "0.0.1.0";
// dev
const APP_VERSION_CODE_DEV = "0.0.6.2-dev";
// prod
const APP_VERSION_CODE_PROD = "1.0.0";

export const APP_VERSION =
  MODE === "uat"
    ? APP_VERSION_CODE_UAT
    : MODE === "prod"
    ? APP_VERSION_CODE_PROD
    : APP_VERSION_CODE_DEV;

export const API_URL =
  MODE === "uat"
    ? "https://reslink-dev-gcf3p.ondigitalocean.app/api/v1.0"
    : MODE === "prod"
    ? "https://reslink-dev-gcf3p.ondigitalocean.app/api/v1.0"
    : "https://reslink-dev-gcf3p.ondigitalocean.app/api/v1.0";

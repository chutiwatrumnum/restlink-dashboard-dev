export const clientId =
  "462317026303-el6qv1ebdbd7905ldei7e6vrhhggafqh.apps.googleusercontent.com";
// แก้ไข: ใช้ fixed path /auth แทนที่จะใช้ dynamic pathname
export const redirectUri = window.location.origin + "/auth";
export const scope = "openid email profile";
export const responseType = "code";

// ฟังก์ชันสำหรับเก็บและดึง intended destination
export const saveIntendedDestination = (path: string) => {
  sessionStorage.setItem('oauth_intended_destination', path);
};

export const getIntendedDestination = () => {
  const destination = sessionStorage.getItem('oauth_intended_destination');
  sessionStorage.removeItem('oauth_intended_destination'); // ลบหลังใช้
  return destination;
};

// ฟังก์ชันสำหรับทำความสะอาด intended destination (เมื่อ project status เปลี่ยน)
export const clearIntendedDestination = () => {
  sessionStorage.removeItem('oauth_intended_destination');
};

export const startGoogleLogin = (intendedDestination?: string) => {
  // เก็บ intended destination ถ้ามี
  if (intendedDestination) {
    saveIntendedDestination(intendedDestination);
  }
  
  console.log('Google OAuth: Using redirect URI:', redirectUri);
  
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=${responseType}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  console.log('Google OAuth: Full auth URL:', authUrl);
  window.location.href = authUrl;
};

// ฟังก์ชันสำหรับตรวจสอบว่าปัจจุบันอยู่ใน OAuth callback flow หรือไม่
export const isOAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('code') && urlParams.has('scope');
};

// ฟังก์ชันสำหรับทำความสะอาด OAuth parameters จาก URL
export const cleanOAuthUrl = () => {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, "", cleanUrl);
};

export const getAuthCode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};

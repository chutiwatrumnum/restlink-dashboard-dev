export const clientId =
  "462317026303-el6qv1ebdbd7905ldei7e6vrhhggafqh.apps.googleusercontent.com";
export const redirectUri = window.location.origin + window.location.pathname;
export const scope = "openid email profile";
export const responseType = "code";

export const startGoogleLogin = () => {
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=${responseType}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  window.location.href = authUrl;
};

export const getAuthCode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};

export const clientId =
  "166950243777-k3u5l14jdtu3tg72a0jlih3imq8amcrr.apps.googleusercontent.com";
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

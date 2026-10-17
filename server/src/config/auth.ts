const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Add it to server/.env`);
  }
  return value;
};

export const authConfig = {
  googleClientId: required("GOOGLE_CLIENT_ID"),
  accessTokenSecret: required("JWT_ACCESS_SECRET"),
  refreshTokenSecret: required("JWT_REFRESH_SECRET"),
  accessTokenTtlSeconds: 15 * 60, // 15 minutes
  refreshTokenTtlSeconds: 7 * 24 * 60 * 60, // 7 days, extended on every refresh
  // A just-replaced refresh token still works this long, so a refresh whose
  // response got lost (flaky network) doesn't log the user out.
  refreshReuseGraceMs: 60 * 1000,
  isProduction: process.env.NODE_ENV === "production",
};

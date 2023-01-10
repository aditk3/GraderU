// Extracts JWT ticket from cookies and sets authorization header with extracted token
exports.extractJWTCookieToHeader = () => (req, res, next) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const token = cookies
      .split(";")
      .find((cookie) => cookie.trim().startsWith("jwt="))
      .split("=")[1];
    if (token) req.headers.authorization = `Bearer ${token}`;
  }
  next();
};

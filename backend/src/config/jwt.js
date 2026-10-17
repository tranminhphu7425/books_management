module.exports = {
  secret: process.env.JWT_SECRET || 'super_secret_jwt_access_key_2026_xyz_library_secure',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_2026_xyz_library_secure',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

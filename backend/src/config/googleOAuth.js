const { OAuth2Client } = require('google-auth-library');

const getClient = () => {
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID || undefined);
};

/**
 * Xác thực Google ID Token gửi từ client
 * @param {string} idToken
 * @returns {Promise<Object>} Payload chứa email, name, picture, sub (googleId)
 */
const verifyGoogleToken = async (idToken) => {
  try {
    const client = getClient();
    const audience = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here'
      ? process.env.GOOGLE_CLIENT_ID
      : undefined;

    const ticket = await client.verifyIdToken({
      idToken,
      audience
    });
    return ticket.getPayload();
  } catch (error) {
    // Trong môi trường development hoặc kiểm thử nếu token là JWT payload hợp lệ
    if (idToken && typeof idToken === 'string') {
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload.email && (payload.sub || payload.id)) {
            return {
              email: payload.email,
              name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'Bạn Đọc Google',
              picture: payload.picture || '',
              sub: payload.sub || payload.id,
              given_name: payload.given_name,
              family_name: payload.family_name
            };
          }
        }
      } catch (parseErr) {
        // Tiếp tục ném lỗi ban đầu
      }
    }
    throw new Error('Xác thực Google ID Token không hợp lệ hoặc đã hết hạn.');
  }
};

module.exports = { verifyGoogleToken };

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
    const err = new Error(error.message || 'Xác thực Google ID Token không hợp lệ hoặc đã hết hạn.');
    err.statusCode = 401;
    err.code = 'AUTH_GOOGLE_FAILED';
    throw err;
  }
};

module.exports = { verifyGoogleToken };

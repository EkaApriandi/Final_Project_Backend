const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // memastikan format header adalah 'Bearer <token>'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak, token tidak ditemukan'
      });
    }

    const token = authHeader.split(' ')[1];

    // memverifikasi token dengan secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // menyimpan data user ke request agar bisa dipakai di controller
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau kedaluwarsa'
    });
  }
};

module.exports = authenticate;
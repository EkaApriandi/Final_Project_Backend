const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // memeriksa ketersediaan email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const error = new Error('Email sudah terdaftar');
      error.statusCode = 409;
      throw error;
    }

    // melakukan hashing password
    const hashedPassword = await hashPassword(password);

    // menyimpan user baru ke database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // mencari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // memvalidasi user dan password
    if (!user || !(await comparePassword(password, user.password))) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    // membuat token akses
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user didapat dari middleware auth
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diambil',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const error = new Error('Refresh token wajib dikirim');
      error.statusCode = 400;
      throw error;
    }

    // memverifikasi validitas refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      const error = new Error('Refresh token tidak valid atau kedaluwarsa');
      error.statusCode = 401;
      throw error;
    }

    // mengecek apakah user masih terdaftar
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // membuat access token baru
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      message: 'Access token berhasil diperbarui',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken
};
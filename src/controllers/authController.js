const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

// mendaftarkan user baru ke dalam sistem
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // mengecek apakah email sudah terdaftar sebelumnya
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const error = new Error('Email sudah terdaftar');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(password);

    // menyimpan data user baru ke database
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

// menangani proses login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // memvalidasi kecocokan email dan password
    if (!user || !(await comparePassword(password, user.password))) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

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

// mengambil data profil user yang sedang login
const getMe = async (req, res, next) => {
  try {
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

// memperbarui access token menggunakan refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const error = new Error('Refresh token wajib dikirim');
      error.statusCode = 400;
      throw error;
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      const error = new Error('Refresh token tidak valid atau kedaluwarsa');
      error.statusCode = 401;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

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

// memperbarui informasi nama atau email profil
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // mengecek apakah email baru sudah digunakan user lain
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { 
          email: email,
          NOT: { id: userId } 
        }
      });
      if (existingEmail) {
        const error = new Error('Email sudah digunakan oleh pengguna lain');
        error.statusCode = 409;
        throw error;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// mengubah password akun user
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // memverifikasi kebenaran password lama
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      const error = new Error('Password saat ini salah');
      error.statusCode = 400;
      throw error;
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  updateProfile,
  changePassword
};
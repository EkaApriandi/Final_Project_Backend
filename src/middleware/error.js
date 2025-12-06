const { Prisma } = require('@prisma/client');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // menangani error spesifik dari prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Data sudah terdaftar';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Data tidak ditemukan';
    }
  }

  // menangani error validasi joi
  if (err.isJoi) {
    statusCode = 400;
    message = 'Input data tidak valid';
    errors = err.details.map((detail) => detail.message);
  }

  // menangani error jwt
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token tidak valid';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = errorMiddleware;
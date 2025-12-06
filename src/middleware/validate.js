const validate = (schema) => {
  return (req, res, next) => {
    // memvalidasi input req.body dengan schema
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // meneruskan error ke global handler
      return next(error);
    }

    next();
  };
};

module.exports = validate;

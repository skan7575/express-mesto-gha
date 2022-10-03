const jwt = require('jsonwebtoken');
const { UNAUTHORIZED_ERROR } = require('../errors/error_codes');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res
      .status(UNAUTHORIZED_ERROR)
      .send({ message: 'Необходима авторизация' });
    return;
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'PrivateKey');
  } catch (err) {
    res
      .status(UNAUTHORIZED_ERROR)
      .send({ message: 'Необходима авторизация' });
    return;
  }
  req.user = payload;
  next();
};

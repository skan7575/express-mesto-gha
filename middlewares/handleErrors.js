const { BAD_REQUEST, SIGN_UP_ERROR} = require('../errors/error_codes');

module.exports.handleErrors = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  if (err.name === 'CastError') {
    res
      .status(BAD_REQUEST)
      .send({ message: 'Невалидный id' });
  } else {
    res
      .status(statusCode)
      .send({message: statusCode === 500 ? 'Ошибка работы сервера' : message});
  }
  next()
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res
      .status(BAD_REQUEST)
      .send({
        message: 'Некорректные данные',
      });

    next();
  }
  if (err.code === 11000) {
    res
      .status(SIGN_UP_ERROR)
      .send({
        message: 'Пользователь уже зарегистрирован',
      });

    next();
  }
};
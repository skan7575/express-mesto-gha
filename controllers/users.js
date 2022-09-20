const User = require('../models/user');
const { BAD_REQUEST, SERVER_ERROR, NOT_FOUND } = require('../errors/errors');

const readUsers = (req, res) => {
  User.find({})
    .then((user) => {
      res.send({ data: user });
    })
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: 'Объект не найден' });
    });
};

const readUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Невалидный id ' });
      }
      return res.status(SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(NOT_FOUND).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      }
      return res.status(SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const updateUser = async (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!user) {
      return res.status(NOT_FOUND).send('Пользователь с id не найден');
    }
    return res.status(200).send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
    }
    return res.status(SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

const updateAvatar = async (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true },
    );
    if (!user) {
      return res.status(NOT_FOUND).send('Пользователь с id не найден');
    }
    return res.status(200).send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
    }
    return res.status(SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

module.exports = {
  createUser,
  readUsers,
  readUserById,
  updateUser,
  updateAvatar,
};

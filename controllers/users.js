const { BAD_REQUEST, SERVER_ERROR, NOT_FOUND, UNAUTHORIZED_ERROR } = require('../errors/errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltOrRounds = 10;
const User = require('../models/user');


const readUsers = (req, res, next) => {
  User.find({})
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      next(err)
      // res.status(SERVER_ERROR).send({ message: 'Объект не найден' });
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

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
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
  const {email, password, name, about, avatar } = req.body;
  User.findOne({email})
    .then((user) => {
      if (user) {
        return res.send("пользователь с таким email уже зарегистрирован!")
      }

      bcrypt.hash(password, saltOrRounds)
        .then(hashPassword => {
          User.create({email, password: hashPassword, name, about, avatar })
            .then((user) => {
              res.send(user);
            })
            .catch((err) => {
              if (err.name === 'ValidationError') {
                return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
              }
              return res.status(SERVER_ERROR).send({ message: 'Произошла ошибка' });
            });
        })
    })
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


const login = (req, res) => {
  const { email, password } = req.body
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: "Bearer " + jwt.sign({ _id: user._id }, 'PrivateKey', { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      res.status(UNAUTHORIZED_ERROR).send({ message: err.message });
    });
}

module.exports = {
  login,
  createUser,
  readUsers,
  readUserById,
  updateUser,
  updateAvatar,
  getCurrentUser
};

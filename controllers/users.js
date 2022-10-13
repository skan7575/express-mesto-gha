const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  NotFoundError,
} = require('../errors/NotFoundError');
const {
  SignUpError,
} = require('../errors/SignUpError');
const { ValidationError } = require('../errors/ValidationError');
const User = require('../models/user');
const { CastError } = require('../errors/CastError');

const { NODE_ENV, JWT_SECRET } = process.env;

const readUsers = (req, res, next) => {
  User.find({})
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

const readUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((userId) => {
      if (userId == null) {
        throw new NotFoundError('Объект не найден');
      }
      return res.send({ data: userId });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Переданы некорректные данные'));
      } else next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw NotFoundError('Пользователь по указанному _id не найден.');
      }
      return res.send(user);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new SignUpError('Пользователь с данным email уже существует');
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((newUser) => res.send(
      { data: newUser },
    ))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Введены не некорректные данные'));
      } else {
        next(err);
      }
    });
};

const updateUser = async (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!user) {
      throw NotFoundError('Пользователь по указанному _id не найден.');
    }
    return res.status(200).send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidationError('Введены не некорректные данные'));
    } else {
      next(err);
    }
  }
  return res;
};

const updateAvatar = async (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true },
    );
    if (!user) {
      throw NotFoundError('Пользователь по указанному _id не найден.');
    }
    return res.status(200).send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidationError('Введены не некорректные данные'));
    } else {
      next(err);
    }
  }
  return res;
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: `${jwt.sign(
          { _id: user._id },
          (NODE_ENV === 'production' ? JWT_SECRET : 'PrivateKey'),
          { expiresIn: '7d' },
        )}`,
      });
    })
    .catch(next);
};

module.exports = {
  login,
  createUser,
  readUsers,
  readUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
};

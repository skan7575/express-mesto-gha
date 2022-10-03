const { NotFoundError, UserNotFoundError, SignUpError, ValidationError} = require('../errors/ErrorClass')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const readUsers = (req, res, next) => {
  User.find({})
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
};

const readUserById = (req, res, next) => {
  const {id} = req.params
  console.log("readUserById " +id)
  User.findById(id)
    .orFail(new NotFoundError('Запрашиваемый пользователь не найден'))
    .then((user) => {
      res.send(user);
    })
    .catch(next);
}

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw UserNotFoundError('Пользователь по указанному _id не найден.');
      }
      return res.send({ data: user });
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  {
    const {
      name, about, avatar, email, password,
    } = req.body;
    User.findOne({ email })
      .then((user) => {
        if (user) {
          throw new SignUpError('Пользователь с данным email уже существует');
        } return bcrypt.hash(password, 10);
      })
      .then((hash) => User.create({
        name, about, avatar, email, password: hash,
      }))
      .then((newUser) => {
        if (!newUser) {
          return next(new NotFoundError('Объект не найден'));
        } return res.send({
          name: newUser.name,
          about: newUser.about,
          avatar: newUser.avatar,
          email: newUser.email,
          _id: newUser._id,
        });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new ValidationError('Введены не некорректные данные'));
        } next(err);
      });
  };
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
      throw UserNotFoundError('Пользователь по указанному _id не найден.');
    }
    return res.status(200).send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidationError('Введены не некорректные данные'));
    }
    next(err);
  }
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
      throw UserNotFoundError('Пользователь по указанному _id не найден.');
    }
    return res.status(200).send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidationError('Введены не некорректные данные'));
    }
    next(err);
  }
};


const login = (req, res, next) => {
  const { email, password } = req.body
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: "Bearer " + jwt.sign({ _id: user._id }, 'PrivateKey', { expiresIn: '7d' }),
      });
    })
    .catch(next)
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

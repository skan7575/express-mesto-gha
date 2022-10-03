// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validatorEmail = require('validator').isEmail;
const validatorUrl = require('validator').isURL;
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const userSchema = new mongoose.Schema({
  email: {
    unique: true,
    type: String,
    required: true,
    validate: {
      validator: (v) => validatorEmail(v),
      message: 'указан неверный адрес почтового ящика',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // а максимальная — 30 символов
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String, // имя — это строка
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // а максимальная — 30 символов
    default: 'Исследователь',
  },
  avatar: {
    type: String, // имя — это строка
    minlength: 2, // минимальная длина имени — 2 символа
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v) => validatorUrl(v),
      message: 'ошибка в ссылке',
    },

  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Не правильная почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Не правильная почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);

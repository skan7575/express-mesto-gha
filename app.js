require('dotenv').config();
// подключение express
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {
  celebrate, Joi, errors,
} = require('celebrate');
const cors = require('cors');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const { NotFoundError } = require('./errors/NotFoundError');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { handleErrors } = require('./middlewares/handleErrors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
// создаем объект приложения
const { PORT = 3000 } = process.env;
const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://negachyov.nomoredomains.icu'],
}));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(requestLogger); // подключаем логгер запросов
app.get('/crash-test', () => {
  setTimeout(() => {
    console.log(process.env.NODE_ENV);
    console.log('АААА Сервер сейчас упадёт')
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(/^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-/])*)?/),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.use('/cards', auth, routerCards);
app.use('/users', auth, routerUsers);
app.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors());

app.use((err, req, res, next) => { handleErrors(err, res, next); });

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

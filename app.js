// подключение express
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {
  celebrate, Joi, errors,
} = require('celebrate');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const { NotFoundError } = require('./errors/NotFoundError');
const cors = require('cors')
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { handleErrors } = require('./middlewares/handleErrors');
// создаем объект приложения
const { PORT = 3000 } = process.env;
const app = express();

const allowedCors = [
  'https://praktikum.tk',
  'http://praktikum.tk',
  'localhost:3000'
];

app.use(cors({
  origin: '*'
}))
app.use(bodyParser.json());

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');
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

app.use(errors());

app.use((err, req, res, next) => { handleErrors(err, res, next); });

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

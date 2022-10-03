// подключение express
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi } = require('celebrate');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const { NOT_FOUND, BAD_REQUEST } = require('./errors/error_codes');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { handleErrors } = require('./middlewares/handleErrors');
// создаем объект приложения
const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use((err, req, res, next) => {
  if (err) {
    res.status(BAD_REQUEST).send({ message: 'bad JSON' });
  } else {
    next();
  }
});

const errorNotFound = (req, res) => {
  res.status(NOT_FOUND).json({ message: 'Запрашиваемый ресурс не найден' });
};

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

app.use(errorNotFound);
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

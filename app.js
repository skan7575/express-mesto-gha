// подключение express
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
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

app.use('/cards', auth, routerCards);
app.use('/users', auth, routerUsers);
app.post('/signin', login);
app.post('/signup', createUser);

app.use(errorNotFound);
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

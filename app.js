// подключение express
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards')
// создаем объект приложения
const {PORT = 3000} = process.env;
const app = express();

app.use(bodyParser.json());

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '6324499fe6103a5471450ee2' // вставьте сюда _id созданного в предыдущем пункте пользователя
  };
  next();
});

app.use('/users', routerUsers);
app.use('/cards', routerCards)


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

const User = require('../models/user')

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

const readUsers = (req, res) => {
  User.find({})
    .then((user)=> {
      res.send({data: user})
    })
    .catch(() => {
      res.status(500).send({ message: 'Объект не найден'})
    })
}

const readUserById = (req, res) => {
  let errStatus = 400;
  User.findById(req.params.id)
    .orFail(() => {
      errStatus = 404;
      throw new ValidationError('Пользователь по указанному _id не найден.');
    })
    .then((user) => {
      res.send({data: user})
    })
    .catch((err) => {
      res.status(errStatus).send({message: err.message})
    })
}
const createUser = (req, res, next) => {
  const {name, about, avatar} = req.body;
  User.create({name, about, avatar})
    .then((user) => {
    res.send(user);
  })
    .catch((err)=> {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя.'));
      }
      next(err);
    })


}

const updateUser = async (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findOneAndUpdate({name, about})
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!user) {
      res.status(404).send('Пользователь с id не найден');
    }
    res.status(200).send({ data: user });
  }
  catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidationError('Переданы некорректные данные при обновлении профиля.'));
    } else {
      next(err);
    }
  }
}

const updateAvatar = async (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findOneAndUpdate({avatar})
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { avatar},
        { new: true, runValidators: true },
      );
      if (!user) {
        res.status(404).send('Пользователь с id не найден');
      }
      res.status(200).send({ data: user });
      }
    catch (err) {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при обновлении аватара.'));
      } else {
        next(err)
      }
    }
}



const deleteUser = (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user)=> {
      if (!user) {
       return res.status(404).send({message: 'Пользователь с id не найден'});
      }
      res.status(200).send({ data: user });
    })
    .catch(err => res.status(500).send({ message: err }));
};


module.exports = {
  createUser,
  readUsers,
  readUserById,
  deleteUser,
  updateUser,
  updateAvatar
}
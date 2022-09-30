const Card = require('../models/card');
const {BAD_REQUEST, SERVER_ERROR, NOT_FOUND} = require('../errors/errors');

const createCard = (req, res) => {
  const {name, link} = req.body;
  const owner = req.user._id;

  Card.create({name, link, owner})
    .then((card) => res.status(201).send({data: card}))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({message: 'Переданы некорректные данные при создании карточки.'});
      }
      return res.status(SERVER_ERROR).send({message: 'произошла ошибка'});
    });
};

const readCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({data: cards}))
    .catch((err) => {
      res.status(SERVER_ERROR).send({message: err});
    });
};


const deleteCard = (req, res) => {
  const myId = req.user._id;
  const {cardId} = req.params;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
      }
      const owner = card.owner._id.toString();
      if (owner !== myId) {
        return res
          .status(403)
          .send({message: 'У вас недостаточно прав'});
      }
      Card.findByIdAndDelete(cardId)
        .then((card) => {
          return res.status(200).contentType('JSON').send({data: card})
        })
        .catch(() => {
          return res.status(404).send({message: 'Ресурс не найден'})
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({message: 'Переданы некорректные данные при удалении карточки.'});
      }
      return res.status(SERVER_ERROR).send({message: 'произошла ошибка'});
    });

};
//
//
// const deleteCard = (req, res) => {
//   Card.findByIdAndRemove(req.params.cardId)
//     .then((card) => {
//       if (!card) {
//         return res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
//       }
//       return res.status(200).send({ message: 'Карточка удалена' });
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при удалении карточки.' });
//       }
//       return res.status(SERVER_ERROR).send({ message: 'произошла ошибка' });
//     });
// };

const addLikeCard = (req, res) => {
  const userId = req.user._id;
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $addToSet:
        {likes: userId},
    },
    {new: true},
  )
    .then((data) => {
      if (!data) {
        return res.status(NOT_FOUND).send({message: 'Карточка с указанным _id не найдена.'});
      }
      return res.send(data);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({message: 'Переданы некорректные данные для постановки лайка'});
      }
      return res.status(SERVER_ERROR).send({message: 'произошла ошибка'});
    });
};


const deleteLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $pull: {likes: req.user._id},
    },
    {new: true},
  )
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({message: 'Карточка с указанным _id не найдена.'});
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({message: 'Переданы некорректные данные для снятия лайка'});
      }
      return res.status(SERVER_ERROR).send({message: 'произошла ошибка'});
    });
};

module.exports = {
  createCard,
  readCards,
  deleteCard,
  addLikeCard,
  deleteLikeCard,
};

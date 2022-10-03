const Card = require('../models/card');
const { NotFoundError, ValidationError, ForbiddenError} = require('../errors/ErrorClass')

const createCard = (req, res, next) => {
  const {name, link} = req.body;
  const owner = req.user._id;

  Card.create({name, link, owner})
    .then((card) => res.status(201).send({data: card}))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Введены не некорректные данные'));
      } next(err);
    });
};

const readCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({data: cards}))
    .catch(next)
};


const deleteCard = (req, res, next) => {
  const myId = req.user._id;
  const {cardId} = req.params;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      const owner = card.owner._id.toString();
      if (owner !== myId) {
        throw new ForbiddenError('У вас недостаточно прав.');
      }
      Card.findByIdAndDelete(cardId)
        .then((card) => {
          return res.status(200).contentType('JSON').send({data: card})
        })
        .catch(next)
    })
    .catch(next)

};

const addLikeCard = (req, res, next) => {
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
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      return res.send(data);
    })
    .catch(next)
};


const deleteLikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $pull: {likes: req.user._id},
    },
    {new: true},
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      return res.send(card);
    })
    .catch(next)
};

module.exports = {
  createCard,
  readCards,
  deleteCard,
  addLikeCard,
  deleteLikeCard,
};

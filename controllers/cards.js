const Card = require('../models/card');
const { NotFoundError } = require('../errors/NotFoundError');
const { ValidationError } = require('../errors/ValidationError');
const { ForbiddenError } = require('../errors/ForbiddenError');
const { CastError } = require('../errors/CastError');

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Введены не некорректные данные'));
      } else next(err);
    });
};

const readCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .populate('likes')
    .sort({ createdAt : -1 })
    .then((cards) => res.send(cards))
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

const deleteCard = (req, res, next) => {
  const myId = req.user._id;
  const { cardId } = req.params;

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
        .then((cardSend) => res.status(200).contentType('JSON').send(cardSend));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Переданы некорректные данные при удалении карточки'));
      } else next(err);
    });
};

const addLikeCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $addToSet:
        { likes: userId },
    },
    { new: true },
  )
    .populate('owner')
    .populate('likes')
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      return res.send(data);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Переданы некорректные данные при добавлении лайка'));
      } else next(err);
    });
};

const deleteLikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $pull: { likes: req.user._id },
    },
    { new: true },
  )
    .populate('owner')
    .populate('likes')
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Переданы некорректные данные при удалении лайка'));
      } else next(err);
    });
};

module.exports = {
  createCard,
  readCards,
  deleteCard,
  addLikeCard,
  deleteLikeCard,
};

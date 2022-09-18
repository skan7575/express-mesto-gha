const Card = require('../models/card');
const User = require("../models/user");

const createCard = (req, res) => {
  const { name, link} = req.body;
  const owner = req.user._id;
  Card.create({name, link, owner})
    .then((card) => {
      res.status(201).send({data: card})
    })
    .catch(() => {
      res.status(400).send({message: 'Переданы некорректные данные при создании карточки.'})
    })
}

const readCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (!cards) {
        res.status(400).send({message: 'Объект не найден'});

      } return res.send({ data: cards });
    })
    .catch(next);
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card)=> {
      if (!card) {
        return res.status(404).send({message: ' Карточка с указанным _id не найдена.'});
      }
      res.send(card)
    })
    .catch(err => res.status(500).send({ message: err }));
};

const addLikeCard = (req,res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $addToSet: { likes: req.user._id },
    },
  )
    .then((card)=> {
      if(!card) {
        return res.status(404).send({message: ' Передан несуществующий _id карточки./снятии лайка. 404 — Передан несуществующий _id карточки.'});
      }
      res.send(card);
    })
    .catch(err => res.status(500).send({ message: err }));
}

const deleteLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    {
      $pull: { likes: req.user._id}
    }
  )
    .then((card) => {
      if(!card) {
        return res.status(404).send({message: ' — Карточка с указанным _id не найдена./снятии лайка. 404 — Передан несуществующий _id карточки.'});
      }
      res.send(card);
    })
    .catch(err => res.status(500).send({ message: err }));
}

module.exports = {
  createCard,
  readCards,
  deleteCard,
  addLikeCard,
  deleteLikeCard
}
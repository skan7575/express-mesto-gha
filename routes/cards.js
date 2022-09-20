const router = require('express').Router();
const {
  createCard, readCards, deleteCard, addLikeCard, deleteLikeCard,
} = require('../controllers/cards');

router.post('/', createCard);
router.get('/', readCards);
router.delete('/:cardId', deleteCard);
router.put('/:cardId/likes', addLikeCard);
router.delete('/:cardId/likes', deleteLikeCard);

module.exports = router;

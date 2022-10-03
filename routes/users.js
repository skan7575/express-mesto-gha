const router = require('express').Router();
const {
  readUsers, readUserById, updateUser, updateAvatar, getCurrentUser,
} = require('../controllers/users');

router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);
router.get('/me', getCurrentUser);
router.get('/:id', readUserById);
router.get('/', readUsers);

module.exports = router;

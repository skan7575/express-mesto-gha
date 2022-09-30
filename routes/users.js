const router = require('express').Router();
const {
 readUsers, readUserById, updateUser, updateAvatar, getCurrentUser
} = require('../controllers/users');

router.get('/me', getCurrentUser)
router.get('/', readUsers);
router.get('/:id', readUserById);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);
module.exports = router;

const router = require('express').Router();
const { createUser, readUsers, readUserById, updateUser, updateAvatar } = require('../controllers/users')
router.post('/', createUser)
router.get('/', readUsers)
router.get('/:id', readUserById)
router.patch('/me', updateUser)
router.patch('/me/avatar', updateAvatar)
module.exports = router;

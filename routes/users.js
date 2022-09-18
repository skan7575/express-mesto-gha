const router = require('express').Router();
const { createUser, readUsers, readUserById, deleteUser, updateUser, updateAvatar } = require('../controllers/users')
router.post('/', createUser)
router.get('/', readUsers)
router.get('/:id', readUserById)
router.delete('/:id', deleteUser)
router.patch('/:id', updateUser)
router.patch('/me/avatar', updateAvatar)
module.exports = router;

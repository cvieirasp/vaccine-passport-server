const router = require('express').Router();

const { adminController } = require('../controllers');
const tokenHandler = require('../handlers/tokenHandler');

router.get('/summary', tokenHandler.verifyAdminToken, adminController.summary);
router.post('/login', adminController.login);

module.exports = router;

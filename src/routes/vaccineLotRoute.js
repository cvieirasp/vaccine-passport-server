const router = require('express').Router();

const { vaccineLotController } = require('../controllers');
const tokenHandler = require('../handlers/tokenHandler');

router.get('/', tokenHandler.verifyAdminToken, vaccineLotController.list);
router.get('/:id', tokenHandler.verifyAdminToken, vaccineLotController.getById);
router.post('/', tokenHandler.verifyAdminToken, vaccineLotController.create);
router.put('/:id', tokenHandler.verifyAdminToken, vaccineLotController.update);
router.delete('/:id', tokenHandler.verifyAdminToken, vaccineLotController.delete);

module.exports = router;

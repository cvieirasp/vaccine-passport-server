const router = require('express').Router();

const { vaccineController, vaccineLotController } = require('../controllers');
const tokenHandler = require('../handlers/tokenHandler');

router.get('/', tokenHandler.verifyAdminToken, vaccineController.list);
router.get('/:id', tokenHandler.verifyAdminToken, vaccineController.getById);
router.post('/', tokenHandler.verifyAdminToken, vaccineController.create);
router.put('/:id', tokenHandler.verifyAdminToken, vaccineController.update);
router.delete('/:id', tokenHandler.verifyAdminToken, vaccineController.delete);

module.exports = router;

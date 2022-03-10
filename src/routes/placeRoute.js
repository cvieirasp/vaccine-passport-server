const router = require('express').Router();

const { placeController } = require('../controllers');
const tokenHandler = require('../handlers/tokenHandler');

router.get('/', tokenHandler.verifyAdminToken, placeController.list);
router.get('/:id', tokenHandler.verifyToken, placeController.getById);
router.post('/', tokenHandler.verifyToken, placeController.create);
router.put('/:id', tokenHandler.verifyToken, placeController.update);
router.delete('/:id', tokenHandler.verifyToken, placeController.delete);

module.exports = router;

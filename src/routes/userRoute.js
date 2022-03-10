const router = require('express').Router();

const { userController } = require('../controllers');
const tokenHandler = require('../handlers/tokenHandler');

router.get('/', tokenHandler.verifyAdminToken, userController.list);
router.get('/:id', tokenHandler.verifyAdminToken, userController.getById);
router.post('/', tokenHandler.verifyAdminToken, userController.create);
router.put('/:id', tokenHandler.verifyAdminToken, userController.update);
router.delete('/:id', tokenHandler.verifyAdminToken, userController.delete);

router.get('/:id/places', tokenHandler.verifyAdminToken, userController.userPlaces);
router.get('/:id/places-visited', tokenHandler.verifyAdminToken, userController.placeVisited);
router.post('/:id/vaccinated', tokenHandler.verifyAdminToken, userController.vaccinated);
router.post('/:id/check-in', tokenHandler.verifyAdminToken, userController.userCheckinPlace);

module.exports = router;

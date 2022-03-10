const router = require('express').Router();

const adminRoute = require('./adminRoute');
const placeRoute = require('./placeRoute');
const userRoute = require('./userRoute');
const vaccineRoute = require('./vaccineRoute');
const vaccineLotRoute = require('./vaccineLotRoute');

router.use('/admin', adminRoute);
router.use('/place', placeRoute);
router.use('/user', userRoute);
router.use('/vaccine', vaccineRoute);
router.use('/vaccine-lots', vaccineLotRoute);

module.exports = router;

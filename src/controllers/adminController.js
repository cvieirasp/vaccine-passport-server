const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const { Admin, Place, User, UserVaccine, Vaccine, VaccineLot } = require('../models');

exports.login = async (req, res) => {
  try {
    if (!req.body.username || !req.body.username)
      return res.status(400).json('usuário e senha obrigatória');

    const admin = await Admin.findOne({
      username: req.body.username
    });

    if (!admin)
      return res.status(401).json('usuário inválido');

    const decryptedPassword = CryptoJS.AES.decrypt(
      admin.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== req.body.password)
      return res.status(401).json('senha inválida');

    const token = jwt.sign({
      id: admin._id
    }, process.env.TOKEN_SECRET_KEY);

    admin.password = undefined;

    res.status(200).json({
      token,
      admin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.summary = async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    const totalPlace = await Place.countDocuments();

    const totalUserVaccinated = await UserVaccine.aggregate([{
        $group: { _id: "$user" }
    }]).count("user");

    const totalVaccineDose = await VaccineLot.aggregate([{
        $group: {
            _id: null,
            quantity: { $sum: "$quantity" }
        }
    }]);

    const totalVaccineDoseUsed = await VaccineLot.aggregate().group({
        _id: null,
        vaccinated: { $sum: "$vaccinated" }
    });

    const latestVaccineLot = await VaccineLot.find().sort('-createdAt').limit(4).populate('vaccine');

    const totalUserWithOneDose = await UserVaccine.aggregate().group({
        _id: "$user",
        quantity: { $sum: +1 }
    }).match({"quantity": 1}).count('count');

    const totalUserWithAboveTwoDose = await UserVaccine.aggregate().group({
        _id: "$user",
        quantity: { $sum: +1 }
    }).match({"quantity": { $gte: 2 }}).count('count');

    res.status(200).json({
        totalUser,
        totalPlace,
        userVaccinated: totalUserVaccinated[0] ? totalUserVaccinated[0].user : 0,
        availableVaccineDose: (totalVaccineDose[0] ? totalVaccineDose[0].quantity : 0) - (totalVaccineDoseUsed[0] ? totalVaccineDoseUsed[0].vaccinated : 0),
        latestVaccineLot,
        userVaccinatedAnalyst: {
            totalUser,
            userWithAboveTwoDose: totalUserWithAboveTwoDose[0] ? totalUserWithAboveTwoDose[0].count : 0,
            totalUserWithOneDose: totalUserWithOneDose[0] ? totalUserWithOneDose[0].count : 0,
            userWithZeroDose: totalUser - (totalUserVaccinated[0] ? totalUserVaccinated[0].user : 0)
        }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

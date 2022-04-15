const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;

const { Place, User, UserPlace, UserVaccine, Vaccine, VaccineLot } = require('../models');

exports.create = async (req, res) => {
  const {
    idNumber,
    fullName,
    phoneNumber,
    address,
  } = req.body;

  try {
    if (!idNumber)
      return res.status(400).json('número do identificador obrigatório');
    if (!fullName)
      return res.status(400).json('nome obrigatório');
    if (!phoneNumber)
      return res.status(400).json('número do telefone obrigatório');
    if (!address)
      return res.status(400).json('endereço obrigatório');

    let user = await User.findOne({ idNumber: idNumber });
    if (user)
      return res.status(403).json('número do identificador já foi registrado para outra conta');

    user = await User.findOne({ phoneNumber: phoneNumber });
    if (user)
      return res.status(403).json('número do telefone já foi registrado para outra conta');
    
    const newUser = new User({
      idNumber,
      fullName,
      phoneNumber,
      address,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({
      id: savedUser._id
    }, process.env.TOKEN_SECRET_KEY);

    res.status(201).json({
      user: savedUser,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.list = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    for (const user of users) {
      const userVaccine = await UserVaccine.find({
        user: user._id
      }).sort('-createdAt');
      user._doc.vaccine = userVaccine;
    }
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.getById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId)
      return res.status(400).json('identificador do usuário inválido');    
    
    const user = await User.findById(userId);

    const userVaccine = await UserVaccine.find({
      user: user._id
    }).populate('vaccine').populate('vaccineLot').sort('-createdAt');

    const userPlaceVisit = await UserPlace.find({
      user: user._id
    }).populate('place').sort('-createdAt');

    user._doc.vaccinated = userVaccine;
    user._doc.placeVisited = userPlaceVisit;

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.update = async (req, res) => {
  const {
    idNumber,
    fullName,
    phoneNumber,
    address,
  } = req.body;

  try {
    const userId = req.params.id;
    if (!userId)
      return res.status(400).json('identificador do usuário inválido');   

    let user = await User.findOne({ _id: { $ne: userId }, idNumber: idNumber });
    if (user)
      return res.status(403).json('número do identificador já foi registrado para outra conta');

    user = await User.findOne({ _id: { $ne: userId }, phoneNumber: phoneNumber });
    if (user)
      return res.status(403).json('número do telefone já foi registrado para outra conta');
    
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          idNumber,
          fullName,
          phoneNumber,
          address,
        }
      }, {
        new: true
      }
    );

    res.status(200).json(updateUser);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.delete = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId)
      return res.status(400).json('identificador do usuário inválido');   
    
    await UserVaccine.deleteMany({ user: userId });
    await UserPlace.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json('usuário excluído');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.vaccinated = async (req, res) => {
  const {
    vaccineId,
    vaccineLotId,
  } = req.body;

  try {
    const userId = req.params.id;
    if (!userId || !ObjectId.isValid(userId))
      return res.status(400).json('identificador do usuário inválido');  

    if (!vaccineId || !ObjectId.isValid(vaccineId))
      return res.status(400).json('identificador da vacina inválido');
    if (!vaccineLotId || !ObjectId.isValid(vaccineLotId))
      return res.status(400).json('identificador do lote da vacina inválido'); 
    
    const newUserVaccine = new UserVaccine({
      user: userId,
      vaccine: vaccineId,
      vaccineLot: vaccineLotId,
    });
    const savedUserVaccine = await newUserVaccine.save();

    await VaccineLot.findOneAndUpdate({
      _id: vaccineLotId
    }, {
      $inc: { vaccinated: +1 }
    });

    savedUserVaccine._doc.vaccine = await Vaccine.findById(vaccineId);
    savedUserVaccine._doc.vaccineLot = await VaccineLot.findById(vaccineLotId);

    res.status(201).json(savedUserVaccine);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }  
};

exports.userPlaces = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId || !ObjectId.isValid(userId))
      return res.status(400).json('identificador do usuário inválido');  

    const places = await Place.find({
      creator: userId
    }).sort('-createdAt');

    res.status(200).json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }  
};

exports.userCheckinPlace = async (req, res) => {
  const {
    placeId,
  } = req.body;

  try {
    const userId = req.params.id;
    if (!userId || !ObjectId.isValid(userId))
      return res.status(400).json('identificador do usuário inválido');  

    if (!placeId || !ObjectId.isValid(placeId))
      return res.status(400).json('identificador do local inválido');

    const newVisit = await UserPlace({
      user: userId,
      place: placeId,
    });
    const savedUserPlace = await newVisit.save();

    res.status(201).json(savedUserPlace);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }  
};

exports.placeVisited = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId || !ObjectId.isValid(userId))
      return res.status(400).json('identificador do usuário inválido');  

    const places = await UserPlace.find({
      user: userId
    }).populate('place').sort('-createdAt');

    res.status(200).json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }  
};

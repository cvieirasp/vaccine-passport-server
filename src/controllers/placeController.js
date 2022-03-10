const { Place, UserPlace } = require('../models');

exports.create = async (req, res) => {
  const {
    name,
    address,
  } = req.body;

  try {
    if (!name)
      return res.status(400).json('nome obrigatório');
    if (!address)
      return res.status(400).json('endereço obrigatório');
    
    const newPlace = new Place({
      name,
      address,
      creator: req.user._id,
    });

    const savedPlace = await newPlace.save();

    res.status(201).json(savedPlace);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.list = async (req, res) => {
  try {
    const places = await Place.find().populate('creator').sort('-createdAt');

    let last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    for (const place of places) {
      const userVisitLast24h = await UserPlace.find({
        place: place._id,
        createdAt: {
          $gt: last24h
        }
      }).sort('-createdAt');
      place._doc.userVisitLast24h = userVisitLast24h;
    }
    
    res.status(200).json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.getById = async (req, res) => {
  try {
    const placeId = req.params.id;
    if (!placeId)
      return res.status(400).json('identificador do local inválido');  

    const place = await Place.findById(placeId).populate('creator');

    let last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const userVisitLast24h = await UserPlace.find({
      place: place._id,
      createdAt: {
        $gt: last24h
      }
    }).sort('-createdAt');

    place._doc.userVisitLast24h = userVisitLast24h;

    res.status(200).json(place);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.update = async (req, res) => {
  const {
    name,
    address,
  } = req.body;

  try {
    const placeId = req.params.id;
    if (!placeId)
      return res.status(400).json('identificador do local inválido');  

    const updatePlace = await Place.findByIdAndUpdate(
      {
        _id: placeId,
        creator: req.user._id,
      },
      {
        $set: {
          name,
          address,
        }
      }, {
        new: true
      }
    );

    res.status(200).json(updatePlace);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.delete = async (req, res) => {
  try {
    const placeId = req.params.id;
    if (!placeId)
      return res.status(400).json('identificador do usuário inválido');   
    
    await UserPlace.deleteMany({ place: placeId });
    await Place.findByIdAndDelete({
      _id: placeId,
      creator: req.user._id
    });

    res.status(200).json('local excluído');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

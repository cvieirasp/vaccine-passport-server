const { UserVaccine, Vaccine, VaccineLot } = require('../models');

exports.create = async (req, res) => {
  const {
    name,
  } = req.body;

  try {
    if (!name)
      return res.status(400).json('nome obrigatório');
    
    const newVaccine = new Vaccine({
      name,
    });

    const savedVaccine = await newVaccine.save();
    savedVaccine._doc.quantity = 0;
    savedVaccine._doc.vaccinated = 0;
    savedVaccine._doc.vaccineLots = [];

    res.status(201).json(savedVaccine);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.list = async (req, res) => {
  try {
    const vaccines = await Vaccine.find().sort('-createdAt');

    for (const vaccine of vaccines) {
      const vaccineLots = await VaccineLot.find({
        vaccine: vaccine._id,
      }).sort('-createdAt');
      
      vaccine._doc.quantity = vaccineLots.reduce(
        (total, item) => total + Number(item.quantity), 0
      );

      vaccine._doc.vaccinated = vaccineLots.reduce(
        (total, item) => total + Number(item.vaccinated), 0
      );

      vaccine._doc.vaccineLots = vaccineLots;
    }

    res.status(200).json(vaccines);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.getById = async (req, res) => {
  try {
    const vaccineId = req.params.id;
    if (!vaccineId)
      return res.status(400).json('identificador da vacina inválido');  

    const vaccine = await Vaccine.findById(vaccineId);

    const vaccineLots = await VaccineLot.find({
      vaccine: vaccine._id,
    }).sort('-createdAt');
    
    vaccine._doc.quantity = vaccineLots.reduce(
      (total, item) => total + Number(item.quantity), 0
    );

    vaccine._doc.vaccinated = vaccineLots.reduce(
      (total, item) => total + Number(item.vaccinated), 0
    );

    vaccine._doc.vaccineLots = vaccineLots;

    res.status(200).json(vaccine);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.update = async (req, res) => {
  const {
    name,
  } = req.body;

  try {
    const vaccineId = req.params.id;
    if (!vaccineId)
      return res.status(400).json('identificador da vacina inválido');  
    
      const updateVaccine = await Vaccine.findByIdAndUpdate(
        vaccineId,
        {
          $set: {
            name,
          }
        }, {
          new: true
        }
      );

    res.status(200).json(updateVaccine);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.delete = async (req, res) => {
  try {
    const vaccineId = req.params.id;
    if (!vaccineId)
      return res.status(400).json('identificador da vacina inválido');  
    
    await UserVaccine.deleteMany({ vaccine: vaccineId });
    await VaccineLot.deleteMany({ vaccine: vaccineId });
    await Vaccine.findByIdAndDelete(vaccineId);

    res.status(200).json('vacina excluída');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

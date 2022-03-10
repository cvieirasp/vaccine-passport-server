const ObjectId = require('mongoose').Types.ObjectId;

const { UserVaccine, Vaccine, VaccineLot } = require('../models');

exports.create = async (req, res) => {
  const {
    name,
    quantity,
    vaccineId,
  } = req.body;

  try {
    if (!name)
      return res.status(400).json('nome obrigatório');
    if (!quantity || !Number.isInteger(quantity))
      return res.status(400).json('quantidade inválida');
    if (!vaccineId || !ObjectId.isValid(vaccineId))
      return res.status(400).json('identificador da vacina inválido');

    const vacciniExists = await Vaccine.exists({ _id: vaccineId });
    if (!vacciniExists)
      return res.status(404).json('vacina não encontrada para o identificador solicitado');

    const newVaccineLot = new VaccineLot({
      name,
      quantity,
      vaccinated: 0,
      vaccine: vaccineId
    });

    const savedVaccineLot = await newVaccineLot.save();
    res.status(201).json(savedVaccineLot);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.list = async (req, res) => {
  try {
    const vaccineLots = await VaccineLot.find().populate('vaccine').sort('-createdAt');
    res.status(200).json(vaccineLots);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.getById = async (req, res) => {
  try {
    const vaccineLotId = req.params.id;
    if (!vaccineLotId)
      return res.status(400).json('identificador do lote da vacina inválido');  

    const vaccineLot = await VaccineLot.findById(vaccineLotId).populate('vaccine');
    res.status(200).json(vaccineLot);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.update = async (req, res) => {
  const {
    name,
    quantity,
    vaccineId,
  } = req.body;

  try {
    const vaccineLotId = req.params.id;
    if (!vaccineLotId)
      return res.status(400).json('identificador do lote da vacina inválido');  

      const updateVaccineLot = await VaccineLot.findByIdAndUpdate(
        vaccineLotId,
        {
          $set: {
            name,
            quantity,
            vaccineId,
          }
        }, {
          new: true
        }
      );

    res.status(200).json(updateVaccineLot);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.delete = async (req, res) => {
  try {
    const vaccineLotId = req.params.id;
    if (!vaccineLotId)
      return res.status(400).json('identificador do lote da vacina inválido');  

    await UserVaccine.deleteMany({ vaccineLot: vaccineLotId })
    await VaccineLot.findByIdAndDelete(vaccineLotId);

    res.status(200).json('lote de vacina excluído');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

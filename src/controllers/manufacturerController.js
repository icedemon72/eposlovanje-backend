import { addManufacturer, deleteManufacturer, getManufacturers } from "../services/manufacturerService.js";

export const handleAddManufacturer = async (req, res) => {
  try {
    const done = await addManufacturer(req.body);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}

export const handleDeleteManufacturer = async (req, res) => {
  try {
    const done = await deleteManufacturer(req.body.id);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}

export const handleGetManufacturers = async (req, res) => {
  try {
    if (!req.query.id) {
      req.query.id = 'all';
    }
    const done = await getManufacturers(req.query.id);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }

}
import { getType } from "../services/typeModelService.js";

export const handleGetType = async (req, res) => {
  try {
    const type = {
      ...req.query
    }
    const done = await getType(type);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ message: err.message });
  }
}
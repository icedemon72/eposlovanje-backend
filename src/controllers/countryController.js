import { getCountry } from "../services/countryService.js"

export const handleGetCountry = async (req, res) => {
  try {
    const country = {
      ...req.query
    }
    const done = await getCountry(country);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ message: err.message })
  }
}
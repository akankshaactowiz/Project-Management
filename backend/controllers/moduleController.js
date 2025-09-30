import Module from "../models/Module.js";

export const getAllModules = async (req, res) => {
  try {
    const modules = await Module.find();
    res.json({ modules });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

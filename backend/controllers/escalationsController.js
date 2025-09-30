import EscalationsData from "../models/EscalationsData.js"

export const createEscalation = async (req, res) => {
  try {
    const {
      // No,
      Title,
      "Created Date": CreatedDate,
      Project,
      Feed,
      Description,
      Status,
      "Assigned By": AssignedBy,
      "Assigned To": AssignedTo,
      "Department From": DepartmentFrom,
      "Department To": DepartmentTo,
      Watcher
    } = req.body;

    // Convert Created Date to a Date object
    const createdDate = CreatedDate ? new Date(CreatedDate) : new Date();

    const escalation = new EscalationsData({
      // No,
      Title,
      "Created Date": createdDate,
      Project,
      Feed,
      Description,
      Status,
      "Assigned By": AssignedBy,
      "Assigned To": AssignedTo,
      "Department From": DepartmentFrom,
      "Department To": DepartmentTo,
      Watcher
    });

    await escalation.save();

    res.status(201).json({ message: "Escalation created successfully", escalation });
  } catch (error) {
    console.error("Error creating escalation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getEscalations= async(req, res) => {
    try {
        const data = await EscalationsData.find();
        res.status(200).json(data);
    }catch(err){
        res.status(500).json({message: "Failed to fetch data"})
    }
}

export const getEscalationsById = async (req, res) => {
    try {
        const escalation = await EscalationsData.findById(req.params.id);
        if (!escalation) return res.status(404).json({ message: "Escalation not found" });
        res.status(200).json(escalation);
        // console.log("Escalation details:", escalation); // For debugging
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch escalation" });
    }
    }

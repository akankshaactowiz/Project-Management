import multer from "multer";
import path from "path";
import fs from "fs";

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/projects";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

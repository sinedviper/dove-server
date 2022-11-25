import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import multer from "multer";

export const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync(__dirname + "/images")) {
      fs.mkdirSync(__dirname + "/images");
    }
    cb(null, "src/images");
  },
  filename: (_, file, cb) => {
    file.originalname = uuidv4() + "." + file.originalname.split(".")[1];
    cb(null, file.originalname);
  },
});

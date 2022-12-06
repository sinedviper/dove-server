import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import multer from "multer";

import { dirname } from "../../index";

export const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync(dirname + "/images")) {
      fs.mkdirSync(dirname + "/images");
    }
    cb(null, dirname + "/images");
  },
  filename: (_, file, cb) => {
    file.originalname = uuidv4() + "." + file.originalname.split(".")[1];
    cb(null, file.originalname);
  },
});

import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import multer from "multer";

import { dirname } from "../../index";
import { invalid } from "../constants";
import { UploadService } from "../../services";
import sharp from "sharp";

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

export const checkUpdateAndFormatImage = async (
  req,
  res,
  autorization,
  nameFile: string
) => {
  const uploadService = new UploadService();

  const outpathFile = nameFile.split(".")[0] + ".webp";
  let checkImageInfo = null;
  await sharp(dirname + "/images/" + nameFile)
    .toFormat("webp")
    .toFile(dirname + "/images/" + outpathFile)
    .then((info) => {
      const filePath = dirname + "/images/" + nameFile;
      fs.unlink(filePath, (err) => {
        if (err) console.log(err.message);
      });
      if (info.width > 1920 || info.height > 1080 || info.size > 2000000) {
        checkImageInfo = {
          status: invalid,
          code: 400,
          message: "Choose a different photo, the resolution is too high",
        };
      }
    });
  if (checkImageInfo !== null) {
    const filePath = dirname + "/images/" + outpathFile;
    fs.unlink(filePath, (err) => {
      if (err) console.log(err.message);
    });
    return res.json(checkImageInfo);
  }

  return res.json(
    await uploadService.addFile(nameFile.split(".")[0] + ".webp", {
      req,
      res,
      autorization,
    })
  );
};

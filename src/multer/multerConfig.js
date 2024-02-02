import multer from 'multer';
import path from 'path';
import fs from 'fs';

const date = Date.now();
const folderRand = Math.round(Math.random() * 100);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const folder = `${date}-${folderRand}`;
    const folderPath = `${process.cwd()}/../client/src/assets/uploads/${folder}/`;
    fs.mkdirSync(folderPath, { recursive: true });
    callback(null, folderPath);
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `${uniqueSuffix}${ext}`);
  }
})

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

export default upload;
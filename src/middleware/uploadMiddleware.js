import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directory exists
const dir = 'public/uploads/profiles/';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

export default upload;

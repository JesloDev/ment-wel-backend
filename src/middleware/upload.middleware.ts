import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
const PROFILE_PIC_DIR = path.join(UPLOAD_ROOT, 'profile-pictures');

// Ensure directories exist
[UPLOAD_ROOT, PROFILE_PIC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PROFILE_PIC_DIR),
  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeUser = (req as any).user?.id || 'anon';
    cb(null, `${safeUser}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only image files (jpeg, png, webp, gif) are allowed') as any);
  }
  cb(null, true);
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

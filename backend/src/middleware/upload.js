import multer from 'multer';

// Memory storage: files are streamed on to Cloudinary, never written to disk.
// Max size is TBD per the requirements; 25MB is a placeholder.
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

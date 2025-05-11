import dotenv from 'dotenv';
dotenv.config();

export const DOC_UPLOAD_DIR = process.env.DOC_UPLOAD_DIR || './uploads';

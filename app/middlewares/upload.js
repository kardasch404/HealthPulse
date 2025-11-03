import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/json',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: PDF, JPEG, PNG, JSON, DOC, DOCX, XLS, XLSX, TXT`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: fileFilter
});

export default upload;

import multer from "multer";
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/user/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        // 3746674586-836534453.png
        cb(null, uniqueName);
    },
});

const storageOrder = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/order/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        // 3746674586-836534453.png
        cb(null, uniqueName);
    },
});

const storageMainOrder = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/mainOrder/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        // 3746674586-836534453.png
        cb(null, uniqueName);
    },
});

const handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 1000 },
}).single('image'); // 100mb

const handleMultipartDataOrder = multer({
    storage: storageOrder,
    limits: { fileSize: 1000000 * 1000 },
}).array('file'); // 100mb

const handleMultipartDataMainOrder = multer({
    storage: storageMainOrder,
    limits: { fileSize: 1000000 * 1000 },
}).array('files'); // 100mb

const middlewares = {
    handleMultipartData,
    handleMultipartDataOrder,
    handleMultipartDataMainOrder
}
export default middlewares;
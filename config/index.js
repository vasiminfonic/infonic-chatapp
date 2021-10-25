import dotenv from 'dotenv';
dotenv.config();

export const { PORT, JWTSTRING, MONGODB_URL, SERVER_Path } = process.env;
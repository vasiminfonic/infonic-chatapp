import dotenv from 'dotenv';
dotenv.config();

export const { PORT, JWTSTRING, MONGODB_URL, SERVER_Path, OTP_SECRET, EMAIL_KEY } =
  process.env;
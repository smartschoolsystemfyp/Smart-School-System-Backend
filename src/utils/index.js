import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const catchErrors = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(err.message);
    });
  };
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default catchErrors;

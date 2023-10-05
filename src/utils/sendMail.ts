import nodemailer from "nodemailer";
import { logEvents } from "../middlewares/logger";
export default async function sendMail(
  email: string,
  subject: string,
  html: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      //   service: process.env.SERVICE,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: subject,
      html: html,
    });
    console.log("Email sent successfully!");
  } catch (err) {
    logEvents(`${err}`, "mailerErrLog.log");
    console.log(err);
  }
}

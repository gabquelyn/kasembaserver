import nodemailer from "nodemailer";
import { logEvents } from "../middlewares/logger";
import { v4 as uuid } from "uuid";
export default async function sendMail(
  email: string,
  subject: string,
  html: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      //   service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      //   secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USERNAME,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      html: html,
    });
    console.log("Email sent successfully!");
  } catch (err) {
    logEvents(
      `${uuid()}: ${new Date().toISOString()}\t${err}`,
      "mailerErrLog.log"
    );
    console.log(err);
  }
}

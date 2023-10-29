import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { logEvents } from "../middlewares/logger";

const emailBodyTemplate = fs.readFileSync(
  path.join(__dirname, "../..", "templates", "auth.html"),
  "utf-8"
);

export default async function sendMail(
  email: string,
  subject: string,
  title: string,
  subtitle: string,
  cta: string,
  link: string,
  filename: string
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
      html: emailBodyTemplate
        .replace("[title_placeholder]", title)
        .replace("[subtitle_placeholder]", subtitle)
        .replace("[link_placeholder]", link)
        .replace("[cta_placeholder]", cta),
      attachments: [
        {
          filename,
          path: path.join(__dirname, "../..", "templates", filename),
          cid: "image_cid",
        },
      ],
    });
    console.log("Email sent successfully!");
  } catch (err) {
    logEvents(`${err}`, "mailerErrLog.log");
    console.log(err);
  }
}

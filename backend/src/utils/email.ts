import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });

  console.log("\n================ EMAIL ================");
  console.log("TO:", to);
  console.log("SUBJECT:", subject);
  console.log("MESSAGE:");
  console.log(text);
  console.log("=======================================\n");

  const info = await transporter.sendMail({
    from: '"JobPortal" <no-reply@jobportal.com>',
    to,
    subject,
    text,
  });

  console.log("Preview URL:");
  console.log(nodemailer.getTestMessageUrl(info));
}
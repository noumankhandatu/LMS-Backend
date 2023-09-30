const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const sendMail = async ({ email, subject, template, data }) => {
  // we create a transporter  first
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  });

  //   get the email template path

  const templatePath = path.join(__dirname, "../mails", template);

  const html = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html,
  };
  // then we dispatch it or sent it
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;

import sendEmail from "../../email";

export default async user => {
  console.log("send welcome email with user ", user);
  const subject = "Seja bem vindo ao Sumá";
  const email = {
    to: user.email,
    from: process.env.EMAIL_FROM,
    subject,
    templateId: process.env.EMAIL_TEMPLATE_USER_WELCOME,
    code: user.accessCode.code || "0000",
    dynamic_template_data: {
      name: user.name,
      first: user.name.substr(0, user.name.indexOf(" ")),
      last: user.name.substr(user.name.lastIndexOf(" ")),
      email: user.email,
      code: user.accessCode.code || "0000",
      link: `${process.env.SERVE_DOMAIN}/access/verify-code/${user._id}`
      // mobile
      // avatar
      // subject
    }
  };

  return await sendEmail(email);
};

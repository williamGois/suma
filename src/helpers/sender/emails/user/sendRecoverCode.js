import sendEmail from "../../email";

export default async user => {
  console.log("SEND CODE VARS", user);
  const email = {
    personalizations: [{
      to: [{
        email: user.email,
      }],
      dynamic_template_data: {
        subject: "Recuperação de senha sumá",
        name: user.name,
        first: user.name.substr(0, user.name.indexOf(" ")),
        last: user.name.substr(user.name.lastIndexOf(" ")),
        email: user.email,
        code: user.accessCode.code || "0000",
        link: `${process.env.SERVE_DOMAIN}/access/update/${user._id}/${user.accessCode.code}`
      },
    }],
    from: {
      email: process.env.EMAIL_FROM,
    },
    templateId: process.env.EMAIL_TEMPLATE_USER_RECOVER,
  };
  return await sendEmail(email)
};

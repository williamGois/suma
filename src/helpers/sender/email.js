import sendGrid from "@sendgrid/mail";

export default (email, templateData) => {
  console.log("SENDING EMAIL SET API KEY", email)
  sendGrid.setApiKey(process.env.SENDGRID_KEY);

  return sendGrid.send(email);
};
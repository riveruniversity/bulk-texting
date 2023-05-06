import * as nodemailer from 'nodemailer'
import dotenv from 'dotenv';

import { Util } from 'eztexting-node';
import { Attendee } from '../Types';

dotenv.config();


export interface LogMail {
  subject: string;
  body: string | any;
  to: string;
  person: Attendee;
}


export async function sendEmail(data: LogMail): Promise<Attendee> {

  // In case an error object is passed as body
  const body = typeof data.body === 'string' ? data.body : JSON.stringify(data.body, null, '\t')

  if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS) throw "Missing environment variables EMAIL_USER or EMAIL_PASS."

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: {
      name: process.env.SENDER_NAME || '',
      address: process.env.EMAIL_USER
    },
    to: data.to,
    // to: process.env.ADMIN_EMAIL,
    //replyTo: `"Outreach Department outreach@revival.com"`,
    subject: data.subject,
    html: body
  };

  return transporter.sendMail(mailOptions)
    .then(() => {
      console.log(`📧 Email sent to ${data.person.first} ${data.person.last}`);
			Util.logStatus({ status: 'Success', location: 'email', phone: String(data.person.phone), message: data.person.email, id: data.person.barcode })
      return data.person
    })
    .catch(error => {
      console.log(`🛑 Error trying to send email to ${data.person.first} ${data.person.last}: \n`, error.response, error.code, error.responseCode)
			Util.logStatus({ status: 'Error', location: 'email', message: String(data.person.barcode) +' | '+ error.code + ' | ' + error.message + ' | ' + error.config.url, phone: String(data.person.phone), id: error.status })
      throw error
    })
}
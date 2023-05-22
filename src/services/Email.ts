import * as nodemailer from 'nodemailer'
import dotenv from 'dotenv';

import { Util } from 'eztexting-node';
import { Attendee } from '../Types';

dotenv.config();

const transporter = nodemailer.createTransport({
  pool: true,
  host: "smtp.gmail.com",
  port: 465, // 587 and secure: false
  secure: true, 
  maxConnections: 11,
  maxMessages: Infinity,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


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


  const mailOptions = {
    from: {
      name: process.env.SENDER_NAME || '',
      address: process.env.SENDER_EMAIL || ''
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
			Util.logStatus({ status: 'Success', location: 'email', message: data.person.email, phone: String(data.person.phone), id: data.person.barcode })
      // transporter.close();
      return data.person
    })
    .catch(error => {
      console.log(`🛑 Error trying to send email to ${data.person.first} ${data.person.last}: \n`, error.response, error.code, error.responseCode)
			Util.logStatus({ status: 'Error', location: 'email', message: String(data.person.barcode) +' | '+ error.code + ' | ' + error.message + ' | ' + error.config.url, phone: String(data.person.phone), id: error.status })
      throw error
    })
}
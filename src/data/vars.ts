import dotenv from 'dotenv'
//import "dotenv/config.js";
dotenv.config();
export const qrUrl = process.env.QR_HOST;

export const dbUser = encodeURIComponent(process.env.MONGO_DB_USER || '');
export const dbPass = encodeURIComponent(process.env.MONGO_DB_PASS || '');

//_const qrUrl = `http://localhost:1996`

export const events = {
  carShow: {
    badge: '64b05ebfd4698cd0f5b7a9a7',
    emailTemplate: 'car-show.badge.pug',
    text:  `Here is your digital River Car Club fast pass. Present your fast pass along with your government-issued ID at the check-in.
    Thank you for being a part of the River Car Show.`,
  },
  mlc2023: {
    badge: '65314cfc4fa561c20a8b1ec9',
    emailTemplate: 'mlc-2023.badge.pug',
    text:  `Present your fast pass along with your government-issued ID at the check-in.
    Thank you for joining us at the 2023 Minister's & Leader's Conference - Breakthrough.`
  },
  mensConf: {
    badge: '64ef6630808c7da71dd2d213',
    emailTemplate: 'mens-conf.badge.pug',
    text: ''
  },
  youthConference: {
    emailTemplate: 'conference.badge.pug',

  }
}
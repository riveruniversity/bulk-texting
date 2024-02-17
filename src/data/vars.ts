import dotenv from 'dotenv'
//import "dotenv/config.js";
dotenv.config();
export const qrUrl = process.env.QR_HOST;

export const dbUser = encodeURIComponent(process.env.MONGO_DB_USER || '');
export const dbPass = encodeURIComponent(process.env.MONGO_DB_PASS || '');

//_const qrUrl = `http://localhost:1996`

export const events = {
  wcm2024: {
    badge: '65aab7724fa561c20a8b1ecc',
    emailTemplate: 'wcm-2024.badge.pug',
    title: `Transfigured`,
    text:  `Present your fast pass along with your government-issued ID at the check-in. \nThank you for joining us at the 2024 Winter Camp Meeting - `
  },
  mlc2023: {
    badge: '65314cfc4fa561c20a8b1ec9',
    emailTemplate: 'mlc-2023.badge.pug',
    title: `Breakthrough`,
    text:  `Present your fast pass along with your government-issued ID at the check-in. \nThank you for joining us at the 2024 Minister's & Leader's Conference - `
  },
  mensConf: {
    badge: '64ef6630808c7da71dd2d213',
    emailTemplate: 'mens-conf.badge.pug',
    text: ''
  },
  youthConference: {
    badge: '',
    emailTemplate: 'conference.badge.pug',
    text: ``
  },
  carShow: {
    badge: '64b05ebfd4698cd0f5b7a9a7',
    emailTemplate: 'car-show.badge.pug',
    title: 'River Car Show',
    text:  `Here is your digital River Car Club fast pass. Present your fast pass along with your government-issued ID at the check-in. \nThank you for being a part of the `  // title will be added
  },
  turkeyFest: {
    badge: '655957c04fa561c20a8b1eca',
    emailTemplate: '',
    text: `This pass is for quick entrance. Head to the turkey registration to get a turkey giveaway sticker.`
  },
  christmas: {
    badge: '657cb9264fa561c20a8b1ecb',
    emailTemplate: '',
    text: `Here is your pass is for quick entrance. After checking in, head to the toy registration to get your toy giveaway bracelet.`
  }
}
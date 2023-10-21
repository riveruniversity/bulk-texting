import dotenv from 'dotenv'
//import "dotenv/config.js";
dotenv.config();
export const qrUrl = process.env.QR_HOST;

export const dbUser = encodeURIComponent(process.env.MONGO_DB_USER || '');
export const dbPass = encodeURIComponent(process.env.MONGO_DB_PASS || '');

//_const qrUrl = `http://localhost:1996`

export const badges = {
  carShow: '64b05ebfd4698cd0f5b7a9a7',
  mensConf: '64ef6630808c7da71dd2d213',
  mlc2023: '65314cfc4fa561c20a8b1ec9'
}

export const templates = {
  youthConference: 'conference.badge.pug',
  carShow: 'car-show.badge.pug',
  mensConf: 'mens-conf.badge.pug',
  mlc2023: 'mlc-2023.badge.pug'
}
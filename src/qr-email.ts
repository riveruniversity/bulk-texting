
import pug from 'pug';

import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email'
// import { attendees } from './data/attendees';

import { Attendee, DayTime } from './Types'
import { getDayTime, showPercent, sleep } from './services/Util';
import { events, qrUrl } from './data/vars';
import { getAttendees, updateAttendee } from './services/DB';


// >>> Settings
const event = events.carShow;
const testRun = false;
// >>>> End



const compileFn: pug.compileTemplate = pug.compileFile('src/templates/' + event.emailTemplate, { compileDebug: true });
let failedAttempts = 0;

// >>> Start
(async function sendBulkEmailsWithBarcode() {

  if (!qrUrl) throw "Missing environment variable QR_HOST."
  const filter = testRun ? { _id: '126634' } : { sentEmail: false, email: { $ne: '' }, onMp: true };
  const attendees =  await getAttendees(filter);

  for (let i in attendees) {

    if (failedAttempts > 10) return;

    const attendee: Attendee = attendees[i];
    const file = Buffer.from(`${event.badge}:${attendee.barcode}:${attendee.first} ${attendee.last}`).toString('base64url');
    attendee.url = qrUrl + `/badges/${file}.png`

    showPercent(i, attendees);

    await sleep(5000)
    createEmail(attendee)
      .then(done)
      .catch((error) => failed(error, attendee))
  }
})()
//: -----------------------------------------



async function createEmail(attendee: Attendee) { //: Promise<Attendee> {

  //_console.log('👤  Attendee: ', attendee.barcode)
  const params = { ...{first: attendee.first, url: attendee.url}, ...event, ...{ dayTime: getDayTime() } };
  const body: string = compileFn(params)
  return sendEmail({ subject: `Digital Fast Pass (${attendee.first})`, body, to: attendee.email, person: attendee });

}
//: -----------------------------------------



async function done(attendee: Attendee) {
  updateAttendee(attendee, { sentEmail: true, $unset: { emailError: "" } })
  failedAttempts = 0;
  console.log('✅  Done: ', attendee.barcode)
}

async function failed(error: Error, attendee: Attendee) {
  updateAttendee(attendee, { emailError: error.message });
  failedAttempts++;
  console.log('Failed: ', attendee.barcode)
}
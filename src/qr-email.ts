
import pug from 'pug';

import { sendEmail } from './services/Email'
import { Attendee } from './Types'
import { getDayTime, showPercent, sleep } from './services/Util';
import { events, qrUrl } from './data/vars';
import { getAttendees, updateAttendee } from './services/DB';


// >>> Settings
const event = events.carShow;
const testRun = true;
// >>>> End



const compileFn: pug.compileTemplate = pug.compileFile('src/templates/' + event.emailTemplate, { compileDebug: true });
let failedAttempts = 0;

// >>> Start
(async function sendBulkEmailsWithBarcode() {

  if (!qrUrl) throw "Missing environment variable QR_HOST.";
  if (testRun) console.log(`🚧 running in test mode!`);


  while (true) {

    // const filter = testRun ? { _id: '126634' } : { sentText: false, textError: { $exists: true }, phone: { $ne: "" } };
    const filter = testRun ? { _id: '126634' } : { sentEmail: false, email: { $ne: '' }, onMp: true, textError: { $exists: true } };
    const attendees =  await getAttendees(filter);
    console.log(attendees.length, 'attendees')
  
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

    await sleep(60000)
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
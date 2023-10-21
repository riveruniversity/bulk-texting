
import pug from 'pug';

import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email'
// import { attendees } from './data/attendees';

import { Attendee } from './Types'
import { showPercent, sleep } from './services/Util';
import { badges, templates, qrUrl } from './data/vars';
import { getAttendees, updateAttendee } from './services/DB';


// >>> Settings
const badge = badges.mlc2023
const template = templates.mlc2023
// >>>> End



const compileFn: pug.compileTemplate = pug.compileFile('src/templates/' + template, { compileDebug: true });
failed.attempts = 0;

// >>> Start
(async function sendBulkEmailsWithBarcode() {

  if (!qrUrl) throw "Missing environment variable QR_HOST."
  const attendees = await getAttendees({ sentEmail: false, email: { $ne: '' } });

  for (let i in attendees) {

    const attendee: Attendee = attendees[i];
    const file = Buffer.from(`${badge}:${attendee.barcode}:${attendee.first} ${attendee.last}`).toString('base64url');
    attendee.url = qrUrl + `/badges/${file}.png`

    showPercent(i, attendees);

    await sleep(3000)
    createEmail(attendee)
      .then(done)
      .catch((error) => failed(error, attendee))
  }
})()
//: -----------------------------------------



async function createEmail(attendee: Attendee): Promise<Attendee> {

  //_console.log('👤  Attendee: ', attendee.barcode)

  const body: string = compileFn(attendee)
  return sendEmail({ subject: `Digital Fast Pass (${attendee.first})`, body, to: attendee.email, person: attendee })

}
//: -----------------------------------------



async function done(attendee: Attendee) {
  updateAttendee(attendee, { sentEmail: true })
  console.log('✅  Done: ', attendee.barcode)
}

async function failed(error: Error, attendee: Attendee) {
  updateAttendee(attendee, { emailError: error.message });
  failed.attempts++;
  console.log('Failed: ', attendee.barcode)
}
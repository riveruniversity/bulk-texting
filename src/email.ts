import pug from 'pug';
import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email';
import { showPercent, sleep } from './services/Util';
import { getAttendees, saveAttendees, updateAttendee } from './services/DB';
import { Attendee, AttendeeWithFile } from './Types';
import { qrUrl } from './data/vars';



// >>> Settings
const template: string = 'car-show.waiver.pug'
const compileFn: pug.compileTemplate = pug.compileFile('src/templates/' + template);

// >>> Start
(async function sendBulkEmails() {
  if (!qrUrl) throw 'Missing environment variable QR_HOST.';

  const attendees = await getAttendees({ sentEmail: false, email: { $ne: '' }, onMp: false });
  // const attendees = await getAttendees({ _id: '119104' });


  for (let i in attendees) {
    const attendee: Attendee = attendees[i];

    showPercent(i, attendees);

    await createEmail(attendee)
      .then(done)
      .catch((error) => error);
  }
  console.log('Task Completed 🏁')
})()
//: -----------------------------------------

async function createEmail(attendee: Attendee): Promise<Attendee> {
  //_console.log('👤  Attendee: ', attendee.barcode)
  attendee.url = qrUrl + `/qr/show/${attendee.barcode}.png`;

  const body: string = compileFn(attendee)
  return sendEmail({ subject: 'Car Show - Waiver', body, to: attendee.email, person: attendee })
    .then((attendee) => {
      return attendee;
    })
    .catch((error) => {
      throw error
    })

}
//: -----------------------------------------

async function done(attendee: Attendee) {
  updateAttendee(attendee, { sentEmail: true })
  console.log('✅  Done: ', attendee.barcode);
}

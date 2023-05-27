import pug from 'pug';
import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email';
import { attendees } from './attendees';

import { Attendee, AttendeeWithFile } from './Types';
import { showPercent, sleep } from './services/Util';

const qrUrl = process.env.QR_HOST;

// >>> Settings
const timestamp = ''; //! SET TIMESTAMP 2022-11-20 15:00
const compileFn: pug.compileTemplate = pug.compileFile('src/templates/car-show.badge.pug');

// >>> Start
sendBulkEmails();

async function sendBulkEmails() {
  if (!qrUrl) throw 'Missing environment variable QR_HOST.';

  for (let i in attendees) {
    const attendee: Attendee = attendees[i];

    showPercent(i, attendees);

    await createEmail(attendee)
      .then(done)
      .catch((error) => error);
  }
}
//: -----------------------------------------

async function createEmail(attendee: Attendee): Promise<Attendee> {
  //_console.log('👤  Attendee: ', attendee.barcode)
  attendee.url = qrUrl + `/qr/show/${attendee.barcode}.png`;

	try {
		const body: string = compileFn(attendee)
		return sendEmail({ subject: 'Digital Fast Pass', body, to: attendee.email, person: attendee })
		.then((attendee) => {
      return attendee;
    })
			.catch((error) => { 
				throw error 
			})
	}
	catch (error) {
		console.log(error)
		throw error
	}
}
//: -----------------------------------------

async function done(attendee: Attendee) {
  console.log('✅  Done: ', attendee.barcode);
}

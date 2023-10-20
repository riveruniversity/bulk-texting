
import pug from 'pug';

import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email'
// import { attendees } from './data/attendees';

import { Attendee } from './Types'
import { showPercent, sleep } from './services/Util';
import { badges, templates, qrUrl } from './data/vars';
import { getAttendees, updateAttendee } from './services/DB';


// >>> Settings
const badge = badges.mensConf
const template = templates.mensConf
// >>>> End




const compileFn: pug.compileTemplate = pug.compileFile('src/templates/'+ template, { compileDebug: true });

// >>> Start
(async function sendBulkEmailsWithBarcode() {

	if (!qrUrl) throw "Missing environment variable QR_HOST."
  const attendees = await getAttendees({ sentEmail: false });
  return

	for (let i in attendees) {

		const attendee: Attendee = attendees[i];
    const file = Buffer.from(`${badge}:${attendee.barcode}:${attendee.first} ${attendee.last}`).toString('base64url');
    attendee.url = qrUrl + `/badges/${file}.png`

		showPercent(i, attendees);

		await sleep(2000)
		createEmail(attendee)
			.then(done)
			.catch((error) => error)
	}
})()
//: -----------------------------------------



async function createEmail(attendee: Attendee): Promise<Attendee> {

	//_console.log('👤  Attendee: ', attendee.barcode)

	try {
		const body: string = compileFn(attendee)
		return sendEmail({ subject: `Digital Fast Pass (${attendee.first})`, body, to: attendee.email, person: attendee })
			.then((attendee) => { return attendee })
			.catch((error) => { throw error })
	}
	catch (error) {
		console.log(error)
		throw error
	}
}
//: -----------------------------------------



async function done(attendee: Attendee) {
  updateAttendee( attendee, { sentEmail: true })
	console.log('✅  Done: ', attendee.barcode)
}

import axios from 'axios'
import dotenv from 'dotenv'
import pug from 'pug';

import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email'
import { attendees } from './data/attendees';

import { Attendee } from './Types'
import { showPercent, sleep } from './services/Util';
import { badge, template } from './data/vars';

dotenv.config();
const qrUrl = process.env.QR_HOST;
//_const qrUrl = `http://localhost:1996`


// >>> Settings

const compileFn: pug.compileTemplate = pug.compileFile('src/templates/'+ template.carShow, { compileDebug: true });

// >>> Start
(async function sendBulkEmailsWithBarcode() {

	if (!qrUrl) throw "Missing environment variable QR_HOST."

	for (let i in attendees) {

		const attendee: Attendee = attendees[i];
    const file = Buffer.from(`${badge.carShow}:${attendee.barcode}:${attendee.first} ${attendee.last}`).toString('base64url');
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
	console.log('✅  Done: ', attendee.barcode)
}

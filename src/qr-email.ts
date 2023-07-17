import axios from 'axios'
import dotenv from 'dotenv'
import pug from 'pug';

import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email'
import { attendees } from './data/attendees';

import { Attendee } from './Types'
import { showPercent, sleep } from './services/Util';

dotenv.config();
const qrUrl = process.env.QR_HOST;
//_const qrUrl = `http://localhost:1996`
const badge = {
  532: '64b093dcf9c329b8d780d381', // kids
  533: '64b08d1cf9c329b8d780d380', // youth
  534: '64b4e1a3a503c129ee7f8d4e', // adult
}


// >>> Settings
const template: string = 'conference.badge.pug'
const compileFn: pug.compileTemplate = pug.compileFile('src/templates/'+ template, { compileDebug: true });

// >>> Start
sendBulkEmailsWithBarcode();

async function sendBulkEmailsWithBarcode() {

	if (!qrUrl) throw "Missing environment variable QR_HOST."

	for (let i in attendees) {

		const attendee: Attendee = attendees[i];
    const file = Buffer.from(`${badge[attendee.type]}:${attendee.barcode}:${attendee.first} ${attendee.last}`).toString('base64url');
    attendee.url = qrUrl + `/badges/${file}.png`

		showPercent(i, attendees);

		await sleep(2000)
		createEmail(attendee)
			.then(done)
			.catch((error) => error)
	}
}
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

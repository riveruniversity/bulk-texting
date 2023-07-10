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


// >>> Settings
const template: string = 'car-show.badge.pug'
const compileFn: pug.compileTemplate = pug.compileFile('src/templates/'+ template, { compileDebug: true });

// >>> Start
sendBulkEmailsWithBarcode();

async function sendBulkEmailsWithBarcode() {

	if (!qrUrl) throw "Missing environment variable QR_HOST."

	for (let i in attendees) {

		const attendee: Attendee = attendees[i];

		showPercent(i, attendees);

		await sleep(2000)
		await createBarcode(attendee)
		.then(createEmail)
		// createEmail(attendee)
			.then(done)
			.catch((error) => error)
	}
}
//: -----------------------------------------



async function createBarcode(attendee: Attendee): Promise<Attendee> {

	// console.log("🚀 createBarcode");

	return axios.post(qrUrl + `/qr/create/${attendee.barcode}.png`, {
		firstName: attendee.first,
		lastName: attendee.last,
	})
		.then((res: { status: any; config: any }) => {
			console.log('🎫', 'createBarcode', res.status);
			Util.logStatus({ status: 'Success', location: 'create_barcode', phone: String(attendee.phone), message: attendee.barcode, id: res.status })
			return attendee
		})
		.catch((error: any) => {
			console.error(error.code, error.config.url);
			Util.logStatus({ status: 'Error', location: 'create_barcode', message: attendee.barcode + ' | ' + error.code + ' | ' + error.message + ' | ' + error.config.url, phone: String(attendee.phone), id: error.status })
			throw error
		});
}



async function createEmail(attendee: Attendee): Promise<Attendee> {

	//_console.log('👤  Attendee: ', attendee.barcode)
	// const qrBadgeUrl: string = qrUrl + `/qr/show/${attendee.barcode}.png`;
  // const res = await axios(qrUrl + `/qr/show/${attendee.barcode}.png`, {
  //   responseType: 'arraybuffer'
  // });
  // `data:image/png;base64,${(res.data as Buffer).toString('base64')}`;
	
  attendee.url = qrUrl + `/qr/show/${attendee.barcode}.png`
  
	try {
		const body: string = compileFn(attendee)
		return sendEmail({ subject: 'Digital Fast Pass', body, to: attendee.email, person: attendee })
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

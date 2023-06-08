import axios from 'axios'
import dotenv from 'dotenv'

import { Messages, MediaFilesCreate, MediaFilesDelete } from 'eztexting-node'
import { Message, MessageWithFile, ResponseFormat } from 'eztexting-node'
import { Util } from 'eztexting-node'

import { Attendee, AttendeeWithFile } from './Types'

// >>> Settings
import { attendees } from './attendees';
dotenv.config();

//2023-05-06 10:00
const timestamp = ''; //! SET TIMESTAMP 2022-11-20 15:00
const qrUrl = process.env.QR_HOST
//_const qrUrl = `http://localhost:1996`



// >>> Start
const format: ResponseFormat = 'json';
const newMedia = new MediaFilesCreate(format);
const delMedia = new MediaFilesDelete(format);
const messages = new Messages(format)


// sendBulkMessages();
sendBulkMessagesWithBarcode();

async function sendBulkMessagesWithBarcode() {

	console.log('qrUrl', qrUrl)

	if (!qrUrl) throw "Missing environment variable QR_HOST."

	//await Util.sleep(3000)

	for (let i in attendees) {

		const attendee: Attendee = attendees[i];

		const percent: string = ((+i+1) / attendees.length * 100).toFixed(1)
		console.log('🔔', `${+i + 1} (${percent}%)`, attendee.barcode);

		await createBarcode(attendee)
			.then(()=> newMedia.createMediaFile(attendee, { filetype: 'png', url: qrUrl + '/qr/show/' }, createMessage))

		// await Util.sleep(500)
	}
}
//: -----------------------------------------

// async function sendBulkMessages() {

// 	 await createBarcodes(attendees);
// 	//await Util.sleep(3000)

// 	for(let attendee of attendees) {

// 		//? const isLast: boolean = (+i === (attendees.length -1));

// 		newMedia.createMediaFile(attendee, {filetype: 'png', url: qrUrl + '/qr/show/'}, createMessage)

// 		await Util.sleep(500)
// 	}
// }
// //: -----------------------------------------


async function createBarcode(attendee: Attendee) {

	// console.log("🚀 createBarcode");

	return axios.post(qrUrl + `/qr/create/${attendee.barcode}.png`, {
		firstName: attendee.first,
		lastName: attendee.last,
	})
		.then((res: { status: any; config: any }) => {
			console.log('🎫', 'createBarcode', res.status);
			Util.logStatus({ status: 'Success', location: 'create_barcode', phone: attendee.phone, message: attendee.barcode, id: res.status})
		})
		.catch((error: any) => {
			console.error(error.code, error.config.url);
			Util.logStatus({ status: 'Error', location: 'create_barcode', message: attendee.barcode +' | '+ error.code + ' | ' + error.message + ' | ' + error.config.url, phone: attendee.phone, id: error.status })
		});
}

async function createMessage(attendee: AttendeeWithFile, error?: Error) {

	//_console.log('👤  Attendee: ', attendee.barcode)

	if (error) return;

	var text = ''
	if (!attendee.fam) {
		text = `
		Good afternoon ${attendee.first}. Present your fast pass along with your government-issued ID at the check-in.
		Thank you for joining us at the 2023 Spring Minister's & Leader's Conference - Graduation Ceremony.
		`
	}
	else
		// var text = '' // doesn't work when sending blank text! => don't add Message param with blank text
		var text = `${attendee.first}'s fast pass`

	const message: MessageWithFile = { PhoneNumbers: attendee.phone, StampToSend: timestamp, MessageTypeID: '3', FileID: attendee.file, Message: text };

	messages.sendMessage(message, attendee, deleteMediaFile)
}
//: -----------------------------------------


async function deleteMediaFile(message: MessageWithFile, error?: Error) {

	// console.log('📨  Message: ', message.PhoneNumbers)

	delMedia.deleteMediaFile(message, done)
}


async function done(message: Message) {
	console.log('✅  Done: ', message.PhoneNumbers)
}




async function createAllBarcodes(attendees: Attendee[], error?: Error) {

	console.log("🚀 createBarcodes");
	Util.logStatus({ status: 'Log', location: 'create_barcodes', message: 'started', phone: '' })

	return new Promise<void>(async (resolve) => {

		for (let i = 0; i < attendees.length; i += 10) {

			const attendee = attendees[i]
			const attendeesSlice = attendees.slice(i, i + 10);

			await Promise.all(attendeesSlice.map((attendee, j) => {
				const index = i + j
				// (let attendee of attendees) {
				return axios.post(qrUrl + `/qr/create/${attendee.barcode}.png`, {
					firstName: attendee.first,
					lastName: attendee.last,
					index,
				})
					.then((res: { status: any; config: any }) => {

						let data = JSON.parse(res.config.data)
						let percent = +((index + 1) / attendees.length).toFixed(2) * 100
						console.log('🎫', `${index + 1} (${percent}%)`, 'createBarcodes', res.status);

						//newMedia.createMediaFile(attendees[data.index], {filetype: 'png', url: qrUrl + '/qr/show/'}, createMessage)
					})
					.catch((error: any) => {
						const err = JSON.stringify(error)
						console.error(error.code, error.config.url);
						Util.logStatus({ status: 'Error', location: 'create_barcodes', message: error.code + ' | ' + error.message + ' | ' + error.config.url, phone: error.status })
					});
			}));
		}
		Util.logStatus({ status: 'Log', location: 'create_barcodes', message: 'finished', phone: '' })
		resolve()
	})
}


import { Messages } from 'eztexting-node'
import { Message, MessageWithFile, ResponseFormat } from 'eztexting-node'
import { Util } from 'eztexting-node'
import { Contact } from 'eztexting-node/src/types/Contacts'
import { Attendee, AttendeeWithFile } from './Types'


import { attendees } from './attendees';
import { showPercent } from './services/Util'

const format: ResponseFormat = 'json';
const messages = new Messages(format)
const qrUrl = process.env.QR_HOST;


// >>> Settings
const timestamp = ''; //! SET TIMESTAMP 2022-11-20 15:00

// >>> Start
sendBulkMessages();

async function sendBulkMessages() {

	if (!qrUrl) throw "Missing environment variable QR_HOST."

	for (let i in attendees) {

		const attendee: Attendee = attendees[i];
		
		showPercent(i, attendees)

		createMessage(attendee)

		await Util.sleep(200)
	}
}
//: -----------------------------------------



async function createMessage(attendee: Attendee) {

	var text: string = `
Good morning ${attendee.first},

The River Car Show is held on private property. Every person entering the property is required to sign a Waiver and Liability Form.

To bypass slow registration lines, please sign the waiver online at https://tinyurl.com/rivercarshow?id=69198

We'll have your RIVER CAR CLUB BADGE ready for you at our next show on June 10th, so you can easily enter future events.

River Car Show Updates in Brief:
1. QR Code FAST PASS
2. New Judge Rotations
3. New Best in Show Prize of $750 and Best in Show Trophy
4. New Attractions: RC Car Race Track, Foosball, and Air Hockey Table

Thank you for being a part of the River Car Show.

If you have any questions or comments, please email us at rivercarshow@gmail.com

Thank You,
River Car Show Team`

	const message: MessageWithFile = { PhoneNumbers: attendee.phone, StampToSend: timestamp, MessageTypeID: '3', Message: text };

	messages.sendMessage(message, attendee, done)
}
//: -----------------------------------------


async function done(message: Message) {
	console.log('✅  Done: ', message.PhoneNumbers)
}

import { Messages, Message, Util, Contact } from 'eztexting-node'

import { Attendee } from './Types'

// import { attendees } from './data/attendees';
import { showPercent } from './services/Util'
import { qrUrl } from './data/vars'
import { getAttendees } from './services/DB'

const messages = new Messages()



// >>> Settings
const timestamp = '2023-08-26 10:00'; //! SET TIMESTAMP 2022-11-20 15:00



// >>> Start
(async function sendBulkMessages() {

	if (!qrUrl) throw "Missing environment variable QR_HOST."

  const attendees = await getAttendees({ sentText: false, textError: { $exists: false}, phone: { $ne: '' }});


	for (let i in attendees) {

		const attendee: Attendee = attendees[i];
		
		showPercent(i, attendees)

		createMessage(attendee)

		await Util.sleep(200)
	}
})()
//: -----------------------------------------



async function createMessage(attendee: Attendee) {

	var text: string = `
Good morning ${attendee.first},

The River Car Show is held on private property. Every person entering the property is required to sign a Waiver and Liability Form.

To bypass slow registration lines, please sign the waiver online at https://tinyurl.com/rivercarshow?id=69198

Thank you for being a part of the River Car Show.

If you have any questions or comments, please email us at rivercarshow@gmail.com

Thank You,
River Car Show Team`

	const message: Message = { toNumbers: [attendee.phone], sendAt: timestamp, message: text };

	messages.sendMessage(message, attendee, done)
}
//: -----------------------------------------


async function done(contact: Attendee, message: Message, error: Error) {
	console.log('✅  Done: ', message.toNumbers)
}

import { Messages, Message, Util, Contact } from 'eztexting-node'
import { Log } from 'eztexting-node/build/service/Util'

import { Attendee, Timestamp } from './Types'


// import { attendees } from './data/attendees';
import { showPercent } from './services/Util'
import { qrUrl } from './data/vars'
import { getAttendees, updateAttendee } from './services/DB'

const messages = new Messages()



// >>> Settings
const timestamp: Timestamp = '2024-02-17 09:00'; //! SET TIMESTAMP 2022-11-20 15:00



// >>> Start
(async function sendBulkMessages() {

  if (!qrUrl) throw "Missing environment variable QR_HOST."

  const attendees = await getAttendees({ sentText: false, textError: { $exists: false }, phone: { $ne: '' }, fam: false, onMp: false }); // fam: false == send only to one person per phone
  // const attendees = await getAttendees({ _id: '126634' });
  


  for (let i in attendees) {

    const attendee: Attendee = attendees[i];

    showPercent(i, attendees)

    createMessage(attendee)

    await Util.sleep(200)
  }
})()
//: -----------------------------------------



async function createMessage(attendee: Attendee) {

  // don't use first name as they are signing up several people and we only sent it out once per phone #
  var text: string = `
Good afternoon,

The River Car Show is held on private property. Every person entering the property is required to sign a Waiver and Liability Form.

To bypass slow registration lines, please sign the waiver online at https://tinyurl.com/rivercarshow?id=69703

Thank you for being a part of the River Car Show.

If you have any questions or comments, please email us at rivercarshow@gmail.com

Thank You,
River Car Show Team`

  const message: Message = { toNumbers: [attendee.phone], sendAt: timestamp, message: text };

  messages.sendMessage(message, attendee, done)
}
//: -----------------------------------------


async function done(contact: Attendee, message: Message, error: Log) {

  if (error) {
    const errorMsg: EZError = error && JSON.parse(error.message);
    updateAttendee(contact, { textError: errorMsg.detail })
  }
  else {
    updateAttendee(contact, { sentText: true })
  }
  console.log('✅  Done: ', message.toNumbers)
}





interface EZError {
  status: number;
  title: string;
  detail: string;
  errors: Errors[];
}

interface Errors {
  code: string;
  title: string;
  message: string;
}
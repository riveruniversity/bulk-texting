// import axios from 'axios'
import dotenv from 'dotenv'

import { Messages, MediaFilesCreate, MediaFilesDelete } from 'eztexting-node'
import { Message, MessageWithFile } from 'eztexting-node'
import { Util } from 'eztexting-node'
import { Log } from 'eztexting-node/build/service/Util'

import { Attendee, AttendeeWithFile } from './Types'
import { showPercent, sleep } from './services/Util';

// import { attendees } from './data/attendees';
import { badges, qrUrl } from './data/vars';
import { getAttendees, updateAttendee } from './services/DB'



// >>> Settings
const timestamp = '2023-10-21 20:00'; //! SET TIMESTAMP 2022-11-20 15:00
const badge = badges.mlc2023
const eventText =  `Present your fast pass along with your government-issued ID at the check-in.
Thank you for joining us at the 2023 Minister's & Leader's Conference - Breakthrough.`
// >>>> End



// >>> Start
const newMedia = new MediaFilesCreate();
const delMedia = new MediaFilesDelete();
const messages = new Messages();


(async function sendBulkMessagesWithBarcode() {

  if (!qrUrl) throw "Missing environment variable QR_HOST."

  const attendees = await getAttendees({ sentText: false, textError: { $exists: false}, phone: { $ne: '' } });
  // const attendees = await getAttendees({ sentText: false, textError: { $exists: false}, phone: { $ne: '' }, _id: '126634' });

  for (let i in attendees) {
    const attendee: Attendee = attendees[i];
    if (!attendee.phone) continue;

    const file = Buffer.from(`${badge}:${attendee.barcode}:${attendee.first} ${attendee.last}`).toString('base64url');
    const url = qrUrl + `/badges/${file}.png`

    showPercent(i, attendees);

    while (newMedia.activeHandles > 6) {
      await Util.sleep(500)
    }

    newMedia.createMediaFile(attendee, url, createMessage)
    // await createBarcode(attendee)
    await Util.sleep(911)
  }
})()
//: -----------------------------------------


async function createMessage(attendee: AttendeeWithFile, error?: Error) {

  //_console.log('👤  Attendee: ', attendee.barcode)

  if (error) return failed(attendee);

  var text = ''
  if (!attendee.fam) {
    text = eventText
  }
  else
    // var text = '' // doesn't work when sending blank text! => don't add Message param with blank text
    var text = `${attendee.first}'s fast pass`

  const message: MessageWithFile = { toNumbers: [attendee.phone], sendAt: timestamp, mediaFileId: attendee.file, message: text };

  messages.sendMessage(message, attendee, deleteMediaFile)
}
//: -----------------------------------------


async function deleteMediaFile(attendee: Attendee, message: MessageWithFile, error?: Log) {

  // console.log('📨  Message: ', message)

  if (error) {
    const errorMsg: EZError = error && JSON.parse(error.message);
    updateAttendee(attendee, { textError: errorMsg.detail })
  }
  else {
    updateAttendee(attendee, { sentText: true})
  }

  delMedia.deleteMediaFile(message, done)
}


async function done(message: Message) {
  console.log('✅  Done: ', message.toNumbers)
}

async function failed(attendee: Attendee) {
  console.log('🛑  Failed: ', +attendee.phone, attendee.barcode)
}




// async function createAllBarcodes(attendees: Attendee[], error?: Error) {

//   console.log("🚀 createBarcodes");
//   Util.logStatus({ status: 'Log', location: 'create_barcodes', message: 'started', phone: '' })

//   return new Promise<void>(async (resolve) => {

//     for (let i = 0; i < attendees.length; i += 10) {

//       const attendee = attendees[i]
//       const attendeesSlice = attendees.slice(i, i + 10);

//       await Promise.all(attendeesSlice.map((attendee, j) => {
//         const index = i + j
//         // (let attendee of attendees) {
//         return axios.post(qrUrl + `/qr/create/${attendee.barcode}.png`, {
//           firstName: attendee.first,
//           lastName: attendee.last,
//           index,
//         })
//           .then((res: { status: any; config: any }) => {

//             let data = JSON.parse(res.config.data)
//             let percent = +((index + 1) / attendees.length).toFixed(2) * 100
//             console.log('🎫', `${index + 1} (${percent}%)`, 'createBarcodes', res.status);

//             //newMedia.createMediaFile(attendees[data.index], {filetype: 'png', url: qrUrl + '/qr/show/'}, createMessage)
//           })
//           .catch((error: any) => {
//             const err = JSON.stringify(error)
//             console.error(error.code, error.config.url);
//             Util.logStatus({ status: 'Error', location: 'create_barcodes', message: error.code + ' | ' + error.message + ' | ' + error.config.url, phone: error.status })
//           });
//       }));
//     }
//     Util.logStatus({ status: 'Log', location: 'create_barcodes', message: 'finished', phone: '' })
//     resolve()
//   })
// }


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
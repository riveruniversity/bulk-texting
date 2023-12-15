// import axios from 'axios'
import dotenv from 'dotenv'

import { Messages, MediaFilesCreate, MediaFilesDelete } from 'eztexting-node'
import { Message, MessageWithFile } from 'eztexting-node'
import { Util } from 'eztexting-node'
import { Log } from 'eztexting-node/build/service/Util'

import { Attendee, AttendeeWithFile, Daytime, Timestamp } from './Types'
import { showPercent, sleep } from './services/Util';

// import { attendees } from './data/attendees';
import { events, qrUrl } from './data/vars';
import { getAttendees, updateAttendee } from './services/DB'



// >>> Settings
const timestamp: Timestamp = ''; //! SET TIMESTAMP 2022-11-20 15:00
const dayTime: Daytime = 'evening'
const badge: string = events.turkeyFest.badge;
const eventText: string =  events.turkeyFest.text;
// >>>> End



// >>> Start
const newMedia = new MediaFilesCreate();
const delMedia = new MediaFilesDelete();
const messages = new Messages();


(async function sendBulkMessagesWithBarcode() {

  if (!qrUrl) throw "Missing environment variable QR_HOST."

  const attendees = await getAttendees({ sentText: false, textError: { $exists: false}, phone: { $ne: '' } });
  // const attendees = await getAttendees({ _id: '126634' });

  for (let i in attendees) {
    const attendee: Attendee = attendees[i];
    if (!attendee.phone) continue;

    const file = Buffer.from(`${badge}:${attendee.barcode}:${attendee.first} ${attendee.last}`).toString('base64url');
    const url = qrUrl + `/badges/${file}.png`


    while (newMedia.activeHandles > 6) {
      await Util.sleep(500)
    }

    showPercent(i, attendees);

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
    text = `Good ${dayTime} ${attendee.first}. `+ eventText
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
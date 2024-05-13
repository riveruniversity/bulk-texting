import { Messages, MediaFilesCreate, MediaFilesDelete } from 'eztexting-node'
import { Message, MessageWithFile } from 'eztexting-node'
import { Util } from 'eztexting-node'
import { Log } from 'eztexting-node/build/service/Util'

import { Attendee, AttendeeWithFile, DayTime, Timestamp } from './Types'
import { fixNumber, getDayTime, showPercent, sleep } from './services/Util';

// import { attendees } from './data/attendees';
import { events, qrUrl } from './data/vars';
import { closeConnection, getAttendees, updateAttendee } from './services/DB'



// >>> Settings
const event = events.womansConf;
const timestamp: Timestamp = ''; //! SET TIMESTAMP 2022-11-20 15:00
const testRun = false;
// >>>> End



const newMedia = new MediaFilesCreate();
const delMedia = new MediaFilesDelete();
const messages = new Messages();


(async function sendBulkMessagesWithBarcode() {

  if (!qrUrl) throw "Missing environment variable QR_HOST."

  // [] needs to be sorted by phone no and household id
  
  if (testRun) console.log(`🚧 running in test mode!`);
  const filter = testRun ? { _id: '126634' } : { sentText: false, textError: { $exists: false }, phone: { $ne: '', $not: /\+/ }, onMp: true };
  const attendees =  await getAttendees(filter);

  for (let i in attendees) {
    const attendee: Attendee = attendees[i];
    if (!fixNumber(attendee.phone)) {
      console.log(`⏭️  skipped`, attendee.phone);
      continue
    }

    const file = Buffer.from(`${event.badge}:${attendee.barcode}:${attendee.first} ${attendee.last}`).toString('base64url');
    const url = qrUrl + `/badges/${file}.png`


    while (newMedia.activeHandles > 6) {
      await Util.sleep(500)
    }

    showPercent(i, attendees);

    newMedia.createMediaFile(attendee, url, createMessage)
    // await createBarcode(attendee)
    await Util.sleep(911)
  }
  closeConnection();
})()
//: -----------------------------------------


async function createMessage(attendee: AttendeeWithFile, error?: Error) {

  //_console.log('👤  Attendee: ', attendee.barcode)

  if (error) return failed(attendee);

  var text = ''
  if (!attendee.fam) {
    text = `Good ${getDayTime(timestamp)} ${attendee.first}. \n${event.text}`
  }
  else
    // var text = '' // doesn't work when sending blank text! => don't add Message param with blank text
    var text = `${attendee.first}'s fast pass`

  const message: MessageWithFile = { toNumbers: [fixNumber(attendee.phone)], sendAt: testRun ? '' : timestamp, mediaFileId: attendee.file, message: text };

  messages.sendMessage(message, attendee, deleteMediaFile)
}
//: -----------------------------------------


async function deleteMediaFile(attendee: Attendee, message: MessageWithFile, error?: Log) {

  // console.log('📨  Message: ', message)

  if (error) {
    const errorMsg: EZError = error && JSON.parse(error.message);
    
    const exclude = /(Additional Account Verification Needed)|(Insufficient Balance)/i;
    if (!exclude.test(errorMsg.detail))
      updateAttendee(attendee, { textError: errorMsg.detail })
  }
  else {
    updateAttendee(attendee, { sentText: true })
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
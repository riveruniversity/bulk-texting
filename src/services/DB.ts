import { Schema, model, connect, HydratedDocument, Query, FilterQuery } from 'mongoose';
import { dbUser, dbPass } from '../data/vars';
import { Attendee } from '../Types'
import * as fs from 'fs';



// Schema corresponding to the document interface.
const attendeeSchema = new Schema<Attendee>({
  _id: { type: String, required: true },
  first: { type: String, required: true },
  last: { type: String, required: true },
  email: String,
  phone: String,
  barcode: String,
  fam: { type: Boolean, default: false },
  sentEmail: { type: Boolean, default: false },
  sentText: { type: Boolean, default: false }
});

const Attendee = model<Attendee>('Attendee', attendeeSchema);

(async function connectDB() {
  await connect('mongodb://127.0.0.1:27017/bulk')
    .then(db => console.log(new Date().getTime(), '🔗 connected to MongoDB'))
    .catch(err => console.log(err));
})()

export async function saveAttendee(attendee: Attendee) {
  const doc: HydratedDocument<Attendee> = new Attendee(attendee);
  doc.save()
    .catch(err => console.log('Error when saving attendee: ', attendee, err.result, err.results))
}

export async function updateAttendee(attendee: Attendee, update: BulkInfo) {
  Attendee.updateOne({ barcode: attendee.barcode }, update)
    .catch(err => console.log('Error when updating attendee: ', attendee, err.result, err.results))
}

export async function getAttendees(filter: FilterQuery<Attendee>): Promise<Attendee[]> {
  console.log(new Date().getTime(), '🔗 getting attendees from DB')
  return Attendee.find(filter || {})
}

export async function saveAttendees(attendees: Attendee[]) {
  attendees = attendees.map(a => ({...a, ...{_id: a.barcode}}))
  Attendee.insertMany(attendees, { ordered: false, rawResult: true })
    .then(savedAttendees => console.log('💾 attendees saved', savedAttendees.insertedCount))
    .catch(err => {
      console.log('Error when trying to save all attendees. See errors.json for more details!')
      console.log(err.insertedDocs.length, 'saved.')
      console.log(err.writeErrors.length, 'skipped.')
      fs.writeFileSync(__dirname + '/errors.json', JSON.stringify(err.writeErrors, null, '\t'));
    })
}





interface BulkInfo {
  sentEmail?: boolean;
  sentText?: boolean;
}

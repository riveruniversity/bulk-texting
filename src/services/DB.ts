import * as fs from 'fs';
import { Schema, model, connect, HydratedDocument, Query, FilterQuery, UpdateWithAggregationPipeline, UpdateQuery, Mongoose } from 'mongoose';
import { dbUser, dbPass, dbUrl } from '../data/vars';
import { Attendee } from '../Types'
import { sleep } from './Util';



// Schema corresponding to the document interface.
const attendeeSchema = new Schema<Attendee>({
  _id: { type: String, required: true },
  first: { type: String, required: true },
  last: { type: String, required: true },
  email: String,
  phone: String,
  barcode: String,
  fam: Boolean,
  onMp: Boolean,
  sentEmail: { type: Boolean, default: false },
  sentText: { type: Boolean, default: false },
  textError: String,
  emailError: String
});

const Attendee = model<Attendee>('Attendee', attendeeSchema);


var db: Mongoose | null;
var dbInitiated: boolean = false;

(async function connectDB() {

  db = await connect(dbUrl)
    .then(db => db)
    .catch(err => {
      console.log("🛑 ", err.message);
      return null
    });

  if (db) console.log(new Date().getTime(), '🗃️  connected to MongoDB:', db.connection.name);

  dbInitiated = true;
})()

export async function saveAttendee(attendee: Attendee) {
  const doc: HydratedDocument<Attendee> = new Attendee(attendee);
  doc.save()
    .catch(err => console.log('Error when saving attendee: ', attendee, err.result, err.results))
}

export async function updateAttendee(attendee: Attendee, update: UpdateWithAggregationPipeline | UpdateQuery<Attendee>) {
  Attendee.updateOne({ barcode: attendee.barcode }, update)
    .catch(err => console.log('Error when updating attendee: ', attendee, err.result, err.results))
}

export async function getAttendees(filter: FilterQuery<Attendee>): Promise<Attendee[]> {

  if (!(await awaitDbInit('getAttendees'))) return [];

  console.log(new Date().getTime(), '👥 getting attendees from DB')
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
      fs.writeFileSync('src/data/errors.json', JSON.stringify(err.writeErrors, null, '\t'));
    })
    .finally(() => db?.connection.close())
}

export async function closeConnection() {
  await sleep(10000)
  db?.connection.close();
}


async function awaitDbInit(task: string) {
  while (!dbInitiated) {
    await sleep(50);
  }

  if (!db) return console.log('DB not initialized. Did not execute '+ task);
  else return true;
}


interface BulkInfo {
  sentEmail?: boolean;
  sentText?: boolean;
  textError?: string;
  emailError?: string;
}

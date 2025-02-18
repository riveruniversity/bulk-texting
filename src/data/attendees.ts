import { Attendee } from '../Types'
import { saveAttendees } from '../services/DB'


export const attendees: Attendee[] = [
  {first : "Wilhelm", last : "Mauch", email : "wmauch@revival.com", phone : '8134507575', barcode : '126634', fam : false}
]

saveAttendees(attendees)
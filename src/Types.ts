export interface Attendee {
	first: string;
	last: string;
	email: string;
	phone: string ;
	barcode: string;
	fam?: boolean;
	file?: string;
  onMp?: boolean;

	url?: string;

  // DB
  _id?: string;
  sentEmail?: boolean;
  sentText?: boolean;
  textError?: string;
  emailError?: string;
}

export interface AttendeeWithFile extends Attendee {
	file: string;
}

export type Timestamp = `${number}${number}${number}${number}-${number}${number}-${number}${number} ${number}${number}:${number}${number}` | ''

export type DayTime = 'morning' | 'afternoon' | 'evening'
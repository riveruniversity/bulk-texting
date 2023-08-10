export interface Attendee {
	first: string;
	last: string;
	email: string;
	phone: string ;
	barcode: string;
	fam: boolean;
	file?: string;

	url?: string;
}

export interface AttendeeWithFile extends Attendee {
	file: string;
}


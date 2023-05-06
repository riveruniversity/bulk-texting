export interface Attendee {
	first: string;
	last: string;
	phone: string | number;
	barcode: string;
	fam?: boolean;
	file?: number;
	email: string;
}

export interface AttendeeWithFile extends Attendee {
	file: number;
}


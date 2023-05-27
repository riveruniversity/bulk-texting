export interface Attendee {
	first: string;
	last: string;
	email: string;
	phone: string | number;
	barcode: string;
	fam: boolean;
	file?: number;

	url?: string;
}

export interface AttendeeWithFile extends Attendee {
	file: number;
}


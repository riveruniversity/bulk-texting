import axios from 'axios'
import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email'
import { attendees } from './attendees';

import { Attendee, AttendeeWithFile } from './Types'
import { sleep } from './services/Util';
import { error } from 'console';

// >>> Settings
const timestamp = ''; //! SET TIMESTAMP 2022-11-20 15:00
const qrUrl = process.env.QR_HOST;
//_const qrUrl = `http://localhost:1996`



// >>> Start
sendBulkEmailsWithBarcode();

async function sendBulkEmailsWithBarcode() {

  if (!qrUrl) throw "Missing environment variable QR_HOST."

  for (let i in attendees) {

    const attendee: Attendee = attendees[i];

    const percent: string = ((+i + 1) / attendees.length * 100).toFixed(1)
    console.log('🔔', `${+i + 1} (${percent}%)`, attendee.barcode);

    await createBarcode(attendee)
      .then(createEmail)
      .then(done)
      .catch((error) => error)
  }
}
//: -----------------------------------------



async function createBarcode(attendee: Attendee): Promise<Attendee> {

  // console.log("🚀 createBarcode");

  return axios.post(qrUrl + `/qr/create/${attendee.barcode}.png`, {
    firstName: attendee.first,
    lastName: attendee.last,
  })
    .then((res: { status: any; config: any }) => {
      console.log('🎫', 'createBarcode', res.status);
      Util.logStatus({ status: 'Success', location: 'create_barcode', phone: String(attendee.phone), message: attendee.barcode, id: res.status })
      return attendee
    })
    .catch((error: any) => {
      console.error(error.code, error.config.url);
      Util.logStatus({ status: 'Error', location: 'create_barcode', message: attendee.barcode + ' | ' + error.code + ' | ' + error.message + ' | ' + error.config.url, phone: String(attendee.phone), id: error.status })
      throw error
    });
}



async function createEmail(attendee: Attendee): Promise<Attendee> {

  //_console.log('👤  Attendee: ', attendee.barcode)

  const qrBadgeUrl: string = qrUrl + `/qr/show/${attendee.barcode}.png`;

  const body = `
  <div style="width: 100%; background: #E5E5E5; padding: 35px 0;">
	<center>
		<div style="padding: 2% 5%;">
			<img style="max-width: 230px; min-width: 230px;" src="https://rivercarshow.com/wp-content/uploads/2021/03/car-2--uai-1032x341.png" alt="" /><br /><br /></div>
	</center>
	<div
		style="width: 90%; max-width: 800px; margin: 0 auto;  background: #ffffff; border-radius: 7px; font-family: 'Trebuchet MS';">
		<div style="padding: 2% 5%; color: #505050;">
			<center>
				<h3>Hi ${attendee.first},</h3>
				<p>
					We are excited to inform you that we have worked diligently to resolve past registration issues
					including wi-fi outages, which caused delays and required the completion of additional forms.
				</p>
				<p>
					With the new DIGITAL FAST PASS, you will be able to enter the show quickly by using the fast lane.
				</p>
			</center>

			<br>
			<figure style="border-radius:5px; text-align:center;">

				<img style="width: 80%;border-radius:10px;" src="${qrBadgeUrl}" alt="Fast Pass" />
				<figcaption style="width:90%;margin:0 auto;"><span style="font-size: 11px;">We will have your RIVER CAR CLUB BADGE ready for you at our next show on June 10th, so you can
			        easily enter future events.</span>
				</figcaption>
        Click <a href="${qrBadgeUrl}" target="_blank">HERE</a> if you can't see the fast pass.
			</figure>
			<br>

			<p>
				<div
					style="border-radius: 4px; border: 1px solid #0a81c5; background-color: #ecf5fb; padding: 5px; text-align:left;">
					<strong>✨ Car Show Updates in Brief</strong>
					<ul style="margin: 0px;">
						<li>QR Code FAST PASS</li>
						<li>New Judge Rotations</li>
						<li>New Best in Show Prize of $750 and Best in Show</li>
						<li>New Attractions: RC Car Race Track, Foosball, and Air Hockey Table</li>
					</ul>
				</div>
			</p>


			<p>Thank you for being a part of the River Car Show.</p>

			<p>If you have any questions or comments, please email us at rivercarshow@gmail.com</p>

			<p>
				Thank You,<br>
				River Car Show Team</p>


		</div>
		<!-- <footer
			style="max-width: 100%; background: #444; color: #fff; border-radius: 0 0 5px 5px; text-align: center; font-size: 13px;">
			<br />
			<p><img src="{!SENDER_WEBSITE!}" alt="Signature" width="120" /></p>
				<p><strong>{!SENDER_FIRSTNAME!} {!SENDER_LASTNAME!}</strong><br />{!SENDER_TITLE!}</p>
					<p>+1 (813) 899-0085<br /><br /><br /></p>
		</footer> -->
	</div>
</div>`;
  return sendEmail({ subject: 'Digital Fast Pass', body, to: attendee.email, person: attendee })
    .then((attendee) => { return attendee })
    .catch((error) => { throw error })
}
//: -----------------------------------------



async function done(attendee: Attendee) {
  console.log('✅  Done: ', attendee.phone)
}

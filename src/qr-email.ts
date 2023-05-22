import axios from 'axios'
import dotenv from 'dotenv'

import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email'
import { attendees } from './attendees';

import { Attendee, AttendeeWithFile } from './Types'
import { showPercent, sleep } from './services/Util';

// dotenv.config();
const qrUrl = process.env.QR_HOST;


// >>> Settings
const timestamp = ''; //! SET TIMESTAMP 2022-11-20 15:00
//_const qrUrl = `http://localhost:1996`

// >>> Start
sendBulkEmailsWithBarcode();

async function sendBulkEmailsWithBarcode() {

	if (!qrUrl) throw "Missing environment variable QR_HOST."

	for (let i in attendees) {

		const attendee: Attendee = attendees[i];

		showPercent(i, attendees);

		await sleep(2000)
		// await createBarcode(attendee)
		// .then(createEmail)
		createEmail(attendee)
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

	// const qrBadgeUrl: string = qrUrl + `/qr/show/${attendee.barcode}.png`;
	attendee.url = qrUrl + `/qr/show/${attendee.barcode}.png`;

	const body = `
	<div style="width: 100%; background: #E5E5E5; padding: 35px 0;">
	<header style="padding: 2% 5%; text-align: center;">
		<img style="max-width: 230px; min-width: 230px;" src="https://drive.google.com/uc?export=view&amp;id=1L3W8KjLkoUeQoHqzxgsk_ZeN3L8JWdVj" alt="" /><br /><br />
  </header>
		<div
			style="width: 90%; max-width: 800px; margin: 0 auto;  background: #ffffff; border-radius: 7px; font-family: 'Trebuchet MS';">
			<div style="padding: 2% 5%; color: #505050; text-align:center;">

				<h3>Good Morning ${attendee.first},</h3>
				<p>
					This email contains your DIGITAL FASTPASS.<br>
          With the fastpass, you will be able to enter the Conference quickly by using the fast lane.
				</p>
				<p>
					Present your fast pass along with your government-issued ID at the check-in.
				</p>
				<p>
					
				</p>

				<br>
				<figure style="border-radius:5px; text-align:center;">

					<img style="width: 80%;border-radius:10px;" src="${attendee.url}" alt="Fast Pass" />
					<figcaption style="width:90%;margin:0 auto;">
            <span style="font-size: 12px;">Click <a href="${attendee.url}" target="_blank">HERE</a> if you can't see the fast pass.</span>
					</figcaption>
					
				</figure>
				<br>

				<p>Thank you for joining us at the 2023 Spring Minister's & Leader's Conference - Overflow..</p>
				<p>
          <em>“This is a time of divine deposits where people’s lives will be transformed and changed over eight days!”</em> 
          <br>Dr. Rodney Howard-Browne
        </p>


			</div>
			<footer style="max-width: 100%; background: #444; color: #CCC; border-radius: 0 0 5px 5px; font-size: 13px; line-height:2em;">

					<section
				style="width: 250px; margin: 0 auto 20px; padding-top: 20px; display:flex; align-items:center; flex-wrap:wrap; justify-content:space-evenly;">
			
				<img src="https://pub.revival.com/s/images/rmi-logo-footer@2x.png" alt="logo" style="width: 90px; height: auto;">
				<img src="https://pub.revival.com/s/images/rmi-text-footer@2x.png" alt="rmi-text" style="width: 110px; height: auto;">
						</section>

					<div style="display:flex; justify-content: center; flex-wrap: wrap;">

		

						<article style=" width: 110px; padding:0 25px;">
							<h3>Ministries</h3>
							<ul style="list-style-type: none; padding-left: 0;">
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://revival.com/river/about">River Church</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://www.riverbibleinstitute.com">Bible Institute</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://www.riverschoolofworship.com">School of Worship</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://www.riverschoolofgovernment.com">School of Gov't</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://revival.com/rmima">RMIMA</a></li>
							</ul>
						</article>

						<div style="border-left: solid 1px #4E5054;"></div>

						<article style=" width: 110px; padding:0 25px;">
							<h3>Popular Pages</h3>
							<ul style="list-style-type: none; padding-left: 0;">
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://revival.com/prayer">Prayer Request</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://revival.com/events">Upcoming Events</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://revival.com/giving">Online Giving</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://revival.com/partnership">Partnership</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://revival.com/tvbroadcast">TV Broadcast</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://revival.com/soulwinningtools">Soul Winning
										Tools</a></li>
							</ul>
						</article>

						<div style="border-left: solid 1px #4E5054;"></div>

						<article style=" width: 110px; padding:0 25px;">
							<h3>Follow Us</h3>
							<ul style="list-style-type: none; padding-left: 0;">
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://www.facebook.com/rodneyadonicahowardbrowne/"><i class="icon-facebook"></i>
										Facebook</a>
								</li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://twitter.com/rhowardbrowne"><i class="icon-twitter"></i>
										Twitter</a>
								</li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://www.instagram.com/rodneyhowardbrowne/"><i class="icon-instagram"></i>
										Instagram</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://www.youtube.com/user/rodneyhowardbrowne"><i class="icon-youtube"></i>
										Youtube</a></li>
								<li>
									<a style="color: #CCC; text-decoration: none;" target="_blank"
										href="https://www.periscope.tv/rhowardbrowne" class="periscope">

										<span>Periscope</span>
									</a>
								</li>
							</ul>
						</article>
<div style="border-left: solid 1px transparent;"></div>
			  
					</div>
		    
        <!-- <div style="text-align: center;"> <span>© Copyright 1996-2023 Revival Ministries International</span></div> -->
			</footer>
		</div>
</div>
  `;

	return sendEmail({ subject: 'Digital Fast Pass', body, to: attendee.email, person: attendee })
		.then((attendee) => { return attendee })
		.catch((error) => { throw error })
}
//: -----------------------------------------



async function done(attendee: Attendee) {
	console.log('✅  Done: ', attendee.barcode)
}

import pug from 'pug';
import { Util } from 'eztexting-node';

import { sendEmail } from './services/Email';
import { attendees } from './attendees';

import { Attendee, AttendeeWithFile } from './Types';
import { showPercent, sleep } from './services/Util';

const qrUrl = process.env.QR_HOST;

// >>> Settings
const timestamp = ''; //! SET TIMESTAMP 2022-11-20 15:00
const compileFn: pug.compileTemplate = pug.compileFile('src/templates/car-show.badge.pug');

// >>> Start
sendBulkEmails();

async function sendBulkEmails() {
  if (!qrUrl) throw 'Missing environment variable QR_HOST.';

  for (let i in attendees) {
    const attendee: Attendee = attendees[i];

    showPercent(i, attendees);

    await createEmail(attendee)
      .then(done)
      .catch((error) => error);
  }
}
//: -----------------------------------------

async function createEmail(attendee: Attendee): Promise<Attendee> {
  //_console.log('👤  Attendee: ', attendee.barcode)
  attendee.url = qrUrl + `/qr/show/${attendee.barcode}.png`;
  const body = `
  <div style="width: 100%; background: #E5E5E5; padding: 35px 0;">
	<header style="padding: 2% 5%; text-align: center;">
		<img style="max-width: 230px; min-width: 230px;" src="https://drive.google.com/uc?export=view&amp;id=1L3W8KjLkoUeQoHqzxgsk_ZeN3L8JWdVj" alt="" /><br /><br />
  </header>
		<div
			style="width: 90%; max-width: 800px; margin: 0 auto;  background: #ffffff; border-radius: 7px; font-family: 'Trebuchet MS';">
			<div style="padding: 2% 5%; color: #505050; text-align:center;">

				<h3>Hi ${attendee.first},</h3>
				<p>
					We are excited to inform you that we have worked diligently to resolve past registration issues
					including wi-fi outages, which caused delays and required the completion of additional forms.
				</p>
				<p>
					With the new DIGITAL FAST PASS, you will be able to enter the show quickly by using the fast lane.
				</p>

				<br>
				<figure style="border-radius:5px; text-align:center;">

					<img style="width: 80%;border-radius:10px;" src="${attendee.url}" alt="Fast Pass" />
					<figcaption style="width:90%;margin:0 auto;"><span style="font-size: 11px;">We will have your RIVER CAR CLUB BADGE ready for you at our next show on June 10th, so you can
            easily enter future events.</span>
					</figcaption>
					Click <a href="${attendee.url}" target="_blank">HERE</a> if you can't see the fast pass.
				</figure>
				<br>

				<div
					style="border-radius: 4px; border: 1px solid #0a81c5; background-color: #ecf5fb; padding: 5px; text-align:left;">
					<strong>✨ Car Show Updates in Brief</strong>
					<ul style="margin: 0px;">
						<li>QR Code FAST PASS</li>
						<li>New Judge Rotations</li>
						<li>New Best in Show Prize of $750 and Best in Show</li>
					</ul>
				</div>

				<p>Thank you for being a part of the River Car Show.</p>

				<p>
					Thank You,<br>
        River Car Show Team
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
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://revival.com/river/about">River Church</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://www.riverbibleinstitute.com">Bible Institute</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://www.riverschoolofworship.com">School of Worship</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://www.riverschoolofgovernment.com">School of Gov't</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://revival.com/rmima">RMIMA</a></li>
							</ul>
						</article>

						<div style="border-left: solid 1px #4E5054;"></div>

						<article style=" width: 110px; padding:0 25px;">
							<h3>Popular Pages</h3>
							<ul style="list-style-type: none; padding-left: 0;">
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://revival.com/prayer">Prayer Request</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://revival.com/events">Upcoming Events</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://revival.com/giving">Online Giving</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://revival.com/partnership">Partnership</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://revival.com/tvbroadcast">TV Broadcast</a></li>
								<li><a style="color: #CCC; text-decoration: none;" target="_blank" href="https://revival.com/soulwinningtools">Soul Winning
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
</div>`;

  const email = {
    subject: 'MLC',
    // body: compileFn(attendee),
    body,
    to: attendee.email,
    person: attendee,
  };

  // return Promise.resolve(attendee)

  return sendEmail(email)
    .then((attendee) => {
      return attendee;
    })
    .catch((error) => {
      throw error;
    });
}
//: -----------------------------------------

async function done(attendee: Attendee) {
  console.log('✅  Done: ', attendee.barcode);
}

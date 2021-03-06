import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { check } from 'meteor/check';
import DiscountLog from '../../discountLog/discountLog';
import Members from '../../members/members';
import NotificationLog from '../../notificationLog/notificationLog';
import moment from 'moment';


Meteor.methods({
  paymentConfirmation(_id) {
    check(_id, String);

    // First, check if there is a corresponding discount to this _id
    const discount = DiscountLog.findOne({"_id": _id});

    if (discount) {
      const eventName = discount["eventName"];
      const organizationID = discount["organizationID"];
      const eventID = discount["eventID"];
      const userID = discount["userID"];
      const emailAddress = Members.findOne({"organizationID": organizationID, "userID": userID})["askedEmail"];
      const userName = Members.findOne({"organizationID": organizationID, "userID": userID})["userName"];
      const price = (discount["originalPrice"].toFixed(2) - discount["discountAmount"].toFixed(2)).toFixed(2);

      // Function to send the email (called below)
      const email = (emailAddress) => {
        Email.send({
          to: emailAddress,
          from: "Play Soccer 2 Give <caleb@ps2g.org>",
          replyTo: "Caleb Olson <caleb@ps2g.org>",
          subject: "Success! You RSVPed using a discount!",
          html: "<p>Congrats!</p><p>You've successfully RSVPed to '" + eventName + "', at the special discounted rate of <b>$" + price + "</b>. To view your booking, click <a href='https://www.meetup.com/" + organizationID + "/events/" + eventID + "'>here</a> to go to the event page.</p><p><i>Note that your PayPal confirmation email and bank statement may say 'MeetupFiller'. This is the service we use to offer you discounts at no extra cost to you. By booking this discount, you agreed to our Refund Policy as found in Meetup.</i></p>For good,<br />PS2G<br /><i><a href='https://www.playsoccer2give.com'>Local Games for Global Change</a></i><br /><br /><p><img src='a248.e.akamai.net/secure.meetupstatic.com/photos/event/5/e/d/0/highres_258204272.jpeg' height='100'></p>",
        });
      }

      // Precaution to prevent non-production email sends
      if (!Meteor.isProduction) {
        if (emailAddress.toLowerCase() === "joelsfoster@gmail.com") {
          email(emailAddress);
        } else {
          console.log("WARNING! paymentConfirmation recipient is not authorized to recieve emails outside Production: " + emailAddress);
        }
      } else { // If on Production, send the email
        NotificationLog.insert( {
          "notificationName": "paymentConfirmation",
          "notificationTime": parseInt(moment.utc().format("x")),
          "organizationID": organizationID,
          "eventID": Array.of(eventID),
          "userID": userID,
          "userName": userName,
          "emailAddress": emailAddress
        }, (error, response) => {
          if (error) {
            console.log(error);
          } else {
            email(emailAddress);
          }
        });
      }

    } else { // If no discount for this _id is found, throw an error
      throw console.log("ERROR: discountID does not exist (paymentConfirmation)");
    }
  }
});

import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import DiscountLog from '../discountLog/discountLog';
import Members from '../members/members';
import moment from 'moment';


export const weeklyRecap = (emailAddress, discountIDs) => {

  // Grab each discountID's (_id) details and create an htmlBlock for each one
  const htmlBlocks = discountIDs.map( (_id) => {

    if (discountIDs[0] !== "") {
      const discount = DiscountLog.findOne({"_id": _id});
      const organizationID = discount["organizationID"];
      const eventName = discount["eventName"];
      const eventID = discount["eventID"];
      const userID = discount["userID"];
      const userName = Members.findOne({"organizationID": organizationID, "userID": userID})["userName"];
      const originalPrice = discount["originalPrice"].toFixed(2);
      const discountAmount = discount["discountAmount"].toFixed(2);
      const discountedPrice = (originalPrice - discountAmount).toFixed(2);
      const payPalFees = ((discountedPrice * .029) + .30).toFixed(2);
      const profit = (discountedPrice - payPalFees).toFixed(2);
      const htmlBlock = "<p>Meetup Page & Event Details: <a href='https://www.meetup.com/" + organizationID + "/events/" + eventID + "/'>" + eventName + "</a><br/ >Member: " + userName + " (userID=" + userID + ")<br/ >Original Price: $" + originalPrice + "<br />Discounted Price: $" + discountedPrice + "<br />PayPal Fees: $" + payPalFees + "<br /><b>Profit: $" + profit + "</b></p>";

      return htmlBlock;

    } else {
      return "<p><b>[No MeetupFiller RSVPs this past week]</b></p>";
    }
  });

  // Get total revenues
  const revenues = discountIDs.map( (_id) => {
    if (discountIDs[0] !== "") {
      const discount = DiscountLog.findOne({"_id": _id});
      const originalPrice = discount["originalPrice"].toFixed(2);
      const discountAmount = discount["discountAmount"].toFixed(2);
      const discountedPrice = (originalPrice - discountAmount).toFixed(2);

      return discountedPrice;
    } else {
      return 0.00;
    }
  });

  // Get total profits
  const profits = discountIDs.map( (_id) => {
    if (discountIDs[0] !== "") {
      const discount = DiscountLog.findOne({"_id": _id});
      const originalPrice = discount["originalPrice"].toFixed(2);
      const discountAmount = discount["discountAmount"].toFixed(2);
      const discountedPrice = (originalPrice - discountAmount).toFixed(2);
      const payPalFees = ((discountedPrice * .029) + .30).toFixed(2);
      const profit = (discountedPrice - payPalFees).toFixed(2);

      return profit;
    } else {
      return 0.00;
    }
  });

  const totalRevenue = revenues.reduce( (sum, value) => parseFloat(sum) + parseFloat(value), 0);
  const totalProfit = profits.reduce( (sum, value) => parseFloat(sum) + parseFloat(value), 0);

  // Function to send the email
  const email = (emailAddress) => {

    const discountBlocks = htmlBlocks.join("");

    Email.send({
      to: emailAddress,
      from: "MeetupFiller <joelsfoster@gmail.com>",
      replyTo: "Joel Foster <joelsfoster@gmail.com>",
      subject: "MeetupFiller weekly recap [" + moment().format("MMM D") + "]",
      html: "<p>Hello,</p><p>MeetupFiller generated <b>$" + totalRevenue.toFixed(2) + " in RSVP revenue</b> for you this past week--that's <b>$" + totalProfit.toFixed(2) + " profit</b> in your pocket after PayPal fees! Here's the breakdown:</p>" + discountBlocks + "<p><i>If you have any questions or concerns, please feel free to reply to this email for support!</i></p><p>All the best,<br />Joel</p>",
    });
  }

  // Safety precaution for testing
  if (!Meteor.isProduction) {
    if (emailAddress === "joelsfoster@gmail.com") {
      email(emailAddress);
    } else {
      console.log("WARNING! weeklyRecap recipient is not authorized to recieve emails outside Production: " + emailAddress);
    }
  } else {
    email(emailAddress);
  }
};

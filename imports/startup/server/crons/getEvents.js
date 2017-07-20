import { HTTP } from 'meteor/http';
import Events from '../../../api/events/events';
import AccountSettings from '../../../api/accountSettings/accountSettings';


export const getEvents = () => {

  // For each organization...
  const organizations = AccountSettings.find().fetch();

  organizations.forEach( (organization) => {
    const meetupAPIKey = organization["meetupAPIKey"];
    const organizationID = organization["organizationID"];

    const MAX_SCRAPES = 200; // Meetup's max is 200. If this number exceeds count of games today, it will continue into the past. If you want to try implementing "scroll", this is the <moment.js> format required: "YYYY-MM-DDTHH:mm:ss.0Z"
    const url = 'https://api.meetup.com/' + organizationID + '/events?&sign=true&photo-host=public&page=' + MAX_SCRAPES + '&desc=true&status=past&offset=0&omit=manual_attendance_count,created,duration,fee,id,rsvp_limit,status,updated,utc_offset,waitlist_count,yes_rsvp_count,venue,group,description,how_to_find_us,visibility&key=' + meetupAPIKey;
    // https://api.meetup.com/playsoccer2give/events?&sign=true&photo-host=public&page=200&desc=true&status=past&offset=0&omit=manual_attendance_count,created,duration,fee,id,rsvp_limit,status,updated,utc_offset,waitlist_count,yes_rsvp_count,venue,group,description,how_to_find_us,visibility&key=

    // ...grab the past 200 events...
    HTTP.call( 'GET', url, {}, function( error, response ) {
      if ( error ) {
        console.log( error );
      } else {
        const data = response.data;

        data.forEach( (object) => {

          const eventURL = object["link"];
          const eventURLSplitArray = eventURL.split("/");
          const eventID = eventURLSplitArray[5]; // Example URL: https://www.meetup.com/PlaySoccer2Give/events/241664470/

          const record = {
            "organizationID": organizationID,
            "eventID": eventID,
            "eventName": object["name"],
            "eventTime": parseInt(object["time"])
          };

          // ... and add each event to the database if it doesn't already exist
          if (!Events.findOne(record)) {
            Events.insert(record, (error, response) => {
              if (error) {
                console.log(error)
              } else {
                console.log("Event: " + organizationID + "/" + record["eventID"] + " has been added to the Events collection");
              }
            });
          };
        });
      };
    });
  });
};

const HTTP = require ('sync-request');
const jsonexport = require ('jsonexport');
const fs = require('fs');

// Get event data of past games and store in JSON
const count_of_games_to_scrape = 200;
const OFFSET = 0; // Doesn't work conveniently, just leave it as 0
const lookback_date = '2015-08-18'; // YYYY-MM-DD Make sure to overlap by one day later than the last run so as to not miss anything
const get_past_game_ids = 'https://api.meetup.com/playsoccer2give/events?&sign=true&photo-host=public&page=' + count_of_games_to_scrape + '&desc=true&scroll=since:' + lookback_date + 'T19:45:00.000-04:00&status=past&offset=' + OFFSET + '&omit=name,created,duration,fee,id,rsvp_limit,status,time,updated,utc_offset,waitlist_count,yes_rsvp_count,venue,group,description,how_to_find_us,visibility&key=282a2c7858483325b5b6c5510422e5b';
const event_data = HTTP('GET', get_past_game_ids);
const event_json = JSON.parse(event_data.getBody('utf-8'));
console.log("Scrapping the past " + count_of_games_to_scrape + " games, from " + lookback_date + " backwards.");

// Extract URLs into an array
let event_urls = [];
event_json.forEach( (object) => {
  event_urls.push(object["link"]);
});

// Extract event IDs from those URLs
let event_ids = [];
event_urls.forEach( (url) => {
  event_ids.push(url.slice(46, 55));
});

// Use those event IDs to produce an array of all GET requests to call
let all_get_requests = [];
event_ids.forEach( (event_id) => {
  let url = 'https://api.meetup.com/playsoccer2give/events/' + event_id + '/rsvps?&sign=true&photo-host=public&fields=answers&omit=created,updated,response,guests,event.id,event.yes_rsvp_count,event.utc_offset,member.bio,member.photo,group,member.role,member.event_context,member.title,venue,answers.question_id,answers.updated,answers.question&key=282a2c7858483325b5b6c5510422e5b';
  all_get_requests.push({
    url: url,
    event_id: event_id
  });
});
console.log('We now know which games to grab data from.');


// <---------------------------------------------------------------> //
// Call each GET request and push the data into one big array

let all_members = [];
let api_counter = 0;

// This HTTP call loops through each URL and saves the data to all_members
const http_call = (url_with_event_id) => {
  api_counter += 1;
  const member_data = HTTP('GET', url_with_event_id.url);
  const member_json = JSON.parse(member_data.getBody('utf-8'));
  const event_id = url_with_event_id.event_id;
  member_json.forEach((member) => {
    member.event_id = event_id;
    all_members.push(member);
  });
  console.log("Scrape #" + api_counter + " of " + all_get_requests.length + " was successful! Total member count is now " + all_members.length);
}

// Nest the HTTP call function inside this delay function so the delay happens between each loop iteration
const delayed_call = (url_with_event_id, api_counter) => {
  setTimeout(http_call, 3000 * api_counter, url_with_event_id);
}

// This is the loop mentioned above, which calls for a delayed export after the loop finishes
const loop_function = () => {
  all_get_requests.forEach((url_with_event_id, api_counter) => {
    delayed_call(url_with_event_id, api_counter);
  });
  delayed_export();
}

// This runs the export_function after a long delay
const delayed_export = () => {
  setTimeout(export_function, 3001 * count_of_games_to_scrape);
}

// This export function runs the code down below
const export_function = () => {
  console.log("Total record count is now " + all_members.length);
  export_to_csv();
}

loop_function();


// Export all the member data for all the events into csv format
const export_to_csv = () => {
  console.log('Starting file export process...');
  jsonexport(all_members, (err, data) => {
    if(err) return console.log(err);
    // Export the data into a csv file
    fs.writeFile('Legacy Data Dump lookback_date=' + lookback_date + '.csv', data, (err) => {
      if (err) throw err;
      console.log('File saved!');
    });
  });
}
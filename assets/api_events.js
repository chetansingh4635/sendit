/**
 * Definitions of API events.
 */
var api_events = {};
module.exports = api_events;


// -------------------- CONNECTING ----------------------
api_events.recover_request = {
    name: 'FORGOT PASSWORD',
    desc: 'A User has requested to reset the PASSWORD.',
    event_code: 1
};

api_events.contact_customerCare = {
    name: 'CONTACT CUSTOMER CARE',
    desc: 'A User has requested to contact the customer care.',
    event_code: 2
};


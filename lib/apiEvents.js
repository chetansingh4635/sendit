/**
 * Definitions of API events.
 */
var apiEvents = {};
module.exports = apiEvents;


// -------------------- CONNECTING ----------------------
apiEvents.connect_request = {
    name: 'CONNECT_REQUEST',
    desc: 'A User has requested to connect to you.',
    actionable: true,
    category: 'connect'
};

apiEvents.connected = {
    name: 'CONNECTED',
    desc: 'You are now connected to a user.',
    category: 'connect'
};


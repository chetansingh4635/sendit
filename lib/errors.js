var _ = require('lodash');
var util = require('util');
var errStackParser = require('error-stack-parser');

var statusCode = require('../resources/statusCode');
var messages = require('../resources/messages');
var errorCode = require('../resources/errorCode');

var errors = {};
module.exports = errors;

/**
 * Adds useful methods to errors. Use this to create new type of errors.
 * @param {Number} httpCode - HTTP response code.
 * @param {Number} errorCode - error code.
 * @param {String} description - error description.
 * @param {*} stackFrames - error stack frames.
 */
function ApiError(statusCode, errorCode, message, stackFrames) {
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.message = message;
    this.details = null;
    this.stackFrames = stackFrames;
}
util.inherits(ApiError, Error);
// expose constructor
errors.ApiError = ApiError;

/**
 * sets arbitrary details object to error.
 * @param {Object} detail - detail object.
 * @return error.
 */
ApiError.prototype.withDetails = function (details) {
    this.details = details;
    return this;
}


/**
 * sends error as JSON via express response. Sets appropriate HTTP status as well.
 * @param {Object} response - express response.
 */
ApiError.prototype.sendTo = function (response) {
    // response.status(this.httpCode);
    response.json({ statusCode:this.statusCode, errorCode: this.errorCode, message: this.message, details: this.details });
}

/**
 * Genreates a function to create ApiError when called.
 * @param {Number} httpCode - HTTP response code.
 * @param {Number} errorCode - error code.
 * @param {String} description - error description.
 */
function create(type) {
    return function () {
        // create error stack frames (drop the first one for this function call)
        var stackFrames = _.drop(errStackParser.parse(new Error(errorCode)), 1);

        // filter out node's internal and node_module file links
        stackFrames = stackFrames.filter(function (sf) {
            return _.startsWith(sf.fileName, '/') && sf.fileName.indexOf('node_modules') < 0;
        });

        // return a new error instance, with error stack trace
        return new ApiError(statusCode[type], type, messages[type], stackFrames);
    }
}

function createGeneric(statusCode, errorCode, errorMessage){
    return function(){
        return new ApiError(statusCode, errorCode, errorMessage);
    }
}


//--------------------- Generic ERRORS -------------------------/

errors.internal_error = createGeneric(500, 'INTERNAL_ERROR',
    'Something went wrong on server. Please contact server admin.');

errors.invalid_key = createGeneric(401, 'INVALID_KEY',
            'Please provide a valid api key.');

errors.invalid_auth = createGeneric(401, 'INVALID_AUTH',
    'Valid auth token is required. Please provide a valid auth token along with request.');

errors.invalid_permission = createGeneric(401, 'INVALID_PERMISSION',
    'Permission denied. Current user does not has required permissions for this resource.');

errors.invalid_access = createGeneric(401, 'INVALID_ACCESS',
    'Access denied. Current user does not has access for this resource.');

errors.invalid_input = createGeneric(400, 'INVALID_INPUT',
    'The request input is not as expected by API. Please provide valid input.');

errors.input_too_large = createGeneric(400, 'INPUT_TOO_LARGE',
    'The request input size is larger than allowed.');

errors.invalid_input_format = createGeneric(400, 'INVALID_INPUT_FORMAT',
    'The request input format is not allowed.');

errors.invalid_operation = createGeneric(403, 'INVALID_OPERATION',
    'Requested operation is not allowed due to applied rules. Please refer to error details.');

errors.not_found = createGeneric(404, 'NOT_FOUND',
    'The resource referenced by request does not exists.');

//--------------------- BUSINESS LOGIC ERRORS ---------------------------/

errors.invalid_login = create('invalid_login');

errors.account_disabled = create('account_disabled');

errors.already_register = create('already_register');

errors.approve_check = create('approve_account');

errors.not_registred = create('not_registred');

errors.invalid_auth = create('invalid_auth');

errors.travel_incorrect_dates = create('travel_incorrect_dates');

errors.record_not_exist = create('record_not_exist');

errors.not_allowed = create('not_allowed');

errors.account_not_verified = create('account_not_verified');

errors.can_not_create_intrest = create('can_not_create_intrest');

errors.can_not_link = create('can_not_link');

errors.unable_to_register = create('unable_to_register');

errors.disscussion_not_created = create('disscussion_not_created');

errors.person_not_intrested = create('person_not_intrested');

errors.disscussion_not_started = create('disscussion_not_started');

errors.already_had_partner = create('already_had_partner');

errors.paypal_not_linked = create('paypal_not_linked');

errors.partnerShip_not_created = create('partnerShip_not_created');

errors.payment_failed = create('payment_failed');

errors.has_active_partnerships = create('has_active_partnerships');

errors.discourse_error = create('discourse_error');

errors.invalid_partnership = create('invalid_partnership');

errors.can_not_cancel = create('can_not_cancel');

errors.allready_not_intrested = create('allready_not_intrested');

errors.travel_incorrect_airports = create('travel_incorrect_airports');

errors.partnerShip_not_confirmed = create('partnerShip_not_confirmed');

errors.payment_not_recived = create('payment_not_recived');

errors.incorrect_airports = create('incorrect_airports');

errors.allready_paid =  create('allready_paid');
errors.unable_to_register_creator =  create('unable_to_register_creator');
errors.unable_to_register_sender =  create('unable_to_register_sender');
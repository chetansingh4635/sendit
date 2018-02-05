var resources = {};
var message = require('./messages');
var status_code = require('./statusCode');

module.exports = resources;

resources.not_registred = function() {
	return create('not_registred');
}

resources.already_registered = function(){
	return create('already_registered');
} 
resources.no_email = function() {
	return create('no_email');
}

resources.no_image_found = function() {
	return create('no_image_found');
}

resources.image_uploaded = function(){
	return create("image_uploaded");
}

resources.record_found = function(){
	return create("record_found");
}

resources.invalid_auth = function(){
	return create("invalid_auth");
}


resources.success_logout = function  () {
	return create(message.logout);
};

resources.success_updated = function(){
	return create(message.updated); 
};

resources.success_notUpdated = function(){
	return create(message.notUpdated);
};

resources.success_RecordNotUpdated = function(){
	return create(message.recordNotUpdated);
};

resources.success_Register = function(){
	return create(message.registerSuccess);
};

resources.success_saved = function(){
	return create(message.saveVehicle);
};

resources.success_savedFailed = function(){
	return create(message.saveVehicleFailed);
};

resources.success_uploadImage = function(){
	return create(message.uploadImage);
};

resources.password_reset = function(){
	return create(message.passwordReset);
};

resources.success_uploadImageFailed = function(){
	return create(message.uploadImage);
};

resources.Failed_refresh_request_emailId = function(){
	return create(message.refreshRequestFailedOnEmail);
};

resources.Failed_refresh_request_customerId = function(){
	return create(message.NotValidCustomer);
};

resources.success_refresh_request = function(){
	return create(message.refreshSaved);
};

resources.failed_refresh_request = function(){
	return create(message.refreshRequestNotSaved);
};

resources.failed_refresh_request_schedule = function(){
	return create(message.cannotSchedule);
};

resources.no_record_found = function(){
	return create(message.notFound);
};

resources.failed_refresh_request_update = function(){
	return create(message.cannotDelete);
};

resources.success_refresh_request_update = function(){
	return create(message.refreshRequestUpdated);
};

resources.success_refresh_request_notupdate = function(){
	return create(message.refreshRequestNotUpdated);
};

resources.status_cancel = function(){
	return create(message.cancelStatus);
};

resources.status_cannot_change = function(){
	return create(message.cannotChangeStatus);
};

resources.status_change_cannot_perform = function(){
	return create(message.statusChangeCannotPerform);
};

resources.no_partner = function(){
	return create(message.noPartner);
};

resources.status_change_cannot_proceed = function(){
	return create(message.cancelStatusCantProceed);
};

resources.unableToChangeStatus=function(docStatus,requestStatus){
	 var map = {
	 			  "7":"Reject",
                  "6":"Cancel",
                  "5":"Refreshed",
                  "4":"Refreshing",
                  "3":"Arrived",
                  "2":"En route",
                  "1":"Accepted"
                };
	 return ({ message: message.statusChangeMsgOne + map[docStatus] + message.statusChangeMsgTwo + map[requestStatus], code: 405 });
};

resources.vehicleNotFound=function(){
	return create(message.noVechileFound);
};

resources.deviceNotRegister = function(){
	return create(message.deviceNotRegister);
};

resources.vehicleDelete =function(){
	return create(message.vehicleDelete);
};

resources.pinPaymentErrorRegister = function(){
	return create(message.pinPaymentErrorInRegister);
};

resources.pinPaymentRegisterSuccess = function(){
	return create(message.pinPaymentRegisterSuccess);
};

resources.pinPaymentError = function(){
	return create(message.paymentError);
};



create = function(type){
	return ({statusCode:status_code[type] || status_code['success'], message:message[type]})
};
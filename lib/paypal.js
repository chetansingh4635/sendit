var Promise = require("bluebird"),
    Paypal = require('paypal-adaptive'),
    paypalModule = {},
    config = require('config');

var paypalSdk = new Paypal({
    userId: config.paymentGateway.username,
    password: config.paymentGateway.password,
    signature: config.paymentGateway.signature,
    sandboxEmailAddress: "rishabh.garg@daffodilsw.com",
    deviceIpAddress: "http://0.0.0.1",
    sandbox: true ,//defaults to false,
    AppID:"APP-80W284485P519543T"
});


module.exports = paypalModule;

/*
 * Create the paypal account for app customer
 */
paypalModule.createAccount = function (data, callback) {
    return new Promise(function (resolve, reject) {
        var payload = {
            accountType: data.accountType,
            createAccountWebOptions: data.createAccountWebOptions,
            currencyCode: data.currencyCode,
            dateOfBirth: data.dateOfBirth,
            emailAddress: data.emailAddress,
            citizenshipCountryCode: data.citizenshipCountryCode,
            name: {
                firstName: data.firstName,
                lastName: data.lastName,
            },
            contactPhoneNumber: data.contactPhoneNumber,
            address: {
                line1: data.line1,
                city: data.city,
                countryCode: data.countryCode,
                state: data.state,
                postalCode: data.postalCode,
            },
            preferredLanguageCode: data.preferredLanguageCode,
        };
        paypalSdk.createAccount(payload, function (err, response) {
            if (err) {
                reject({ err: err, response: response });
            } else {
                resolve(response);
            }
        });
    });
};

/*
 * Retrieve the detail of particular payment
 */
paypalModule.getPayDetail = function (paymentObject, callback) {
    return new Promise(function (resolve, reject) {
        var payload = {
            requestEnvelope: {
                errorLanguage: config.paymentGateway.responseLang
            }
        };
        if (paymentObject.transactionId) {
            payload['transactionId'] = paymentObject.transactionId;
        }
        if (paymentObject.payKey) {
            payload['payKey'] = paymentObject.payKey;
        }
        if (paymentObject.trackingId) {
            payload['trackingId'] = paymentObject.trackingId;
        }

        // Call paypal sdk method to retrieve the detail of paypal
        paypalSdk.paymentDetails(payload, function (err, response) {
            console.log("error", err);
            if (err) {
                reject({ err: err, response: response });
            } else {
                resolve(response);
            }
        });
    });
};

/*
 * Pay the amount to multiple receiver
 */
paypalModule.pay = function (data, callback) {
    return new Promise(function (resolve, reject) {

        var payload = {
            requestEnvelope: {
                errorLanguage: config.paymentGateway.responseLang
            },
            currencyCode: config.paymentGateway.defaultCurrency,
            cancelUrl: data.cancelUrl,//'http://test.com/cancel',
            returnUrl: data.returnUrl,//'http://test.com/success',
            receiverList: {
                receiver: data.receiverList
            }
            // {
            //     receiver: [
            //         {
            //             email: 'santosh.singh@daffodilsw.com',
            //             amount: '60.00',
            //             primary: 'false'
            //         },
            //         {
            //             email: 'rohit@daffodilsw.com',
            //             amount: '80.00',
            //             primary: 'true'
            //         }
            //     ]
            // }
        };
        if (data.isDelayedChained) {
            payload["actionType"] = config.paymentGateway.delayedChained;
        }
        else {
            payload["actionType"] = config.paymentGateway.chained;
        }
        if (data.currencyCode) {
            payload["currencyCode"] = data.currencyCode;
        }
        if (data.note) {
            payload["memo"] = data.note;
        }
        paypalSdk.pay(payload, function (err, response) {
            if (err) {
                reject({ err: err, response: response });
            } else {
                resolve(response);
            }
        });
    });
};

/*
 * Pay the amount to single receiver
 */
paypalModule.directPay = function (data, callback) {
    return new Promise(function (resolve, reject) {

        var payload = {
            requestEnvelope: {
                errorLanguage: config.paymentGateway.responseLang
            },
            currencyCode: config.paymentGateway.defaultCurrency,
            cancelUrl: data.cancelUrl,//'http://test.com/cancel',
            returnUrl: data.returnUrl,//'http://test.com/success',
            receiverList: {
                receiver: [data.receiverList]
            }            
        };
        if (data.isDelayedChained) {
            payload["actionType"] = config.paymentGateway.delayedChained;
        }
        else {
            payload["actionType"] = config.paymentGateway.chained;
        }
        if (data.currencyCode) {
            payload["currencyCode"] = data.currencyCode;
        }
        
        paypalSdk.pay(payload, function (err, response) {
            if (err) {
                reject({ err: err, response: response });
            } else {
                resolve(response);
            }
        });
    });
};

/*
 * Complete the payment process to sender
 */
paypalModule.completePayment = function (data) {
    return new Promise(function (resolve, reject) {
        var payload = {
            currencyCode: 'USD',
            requestEnvelope: {
                errorLanguage: config.paymentGateway.responseLang
            },
            payKey: data.payKey
        };

        paypalSdk.executePayment(payload, function (err, response) {
            if (err) {
                reject({ err: err, response: response });
            } else {
                resolve(response);
            }
        });
    });
};

/*
 * Refund the amount to sender
 */
paypalModule.refund = function (data) {
    return new Promise(function (resolve, reject) {
        var payload = {
            requestEnvelope: {
                errorLanguage: config.paymentGateway.responseLang
            }
        };
        if (data.payKey) {
            payload['payKey'] = data.payKey;
        }
        if (data.trackingId) {
            payload['trackingId'] = data.trackingId;
        }
        if (data.currencyCode) {
            payload["currencyCode"] = data.currencyCode;
        }
        paypalSdk.refund(payload, function (err, response) {
            if (err) {
                reject({ err: err, response: response });
            } else {
                resolve(response);
            }
        });
    });
};

/**
 * get the verified use status
 */

paypalModule.getVerifiedStatus = function(data){
    var payload = {
        'accountIdentifier':data.accountIdentifier,
        'firstName': data.firstName,
        'lastName': data.lastName,
        'matchCriteria':'NAME',
        requestEnvelope: {
                errorLanguage: config.paymentGateway.responseLang
            }
    }

    return new Promise(function(resolve, reject){
        paypalSdk.getVerifiedStatus(payload, function(err, response){
            if(err)
                reject({ err: err, response: response });
            else
                resolve(response);
        })
    });
}

paypalModule.convertCurrency = function(data){
    var payload = {
        requestEnvelope: {
                errorLanguage: config.paymentGateway.responseLang
            },
        baseAmountList:data.baseAmountList,
        convertToCurrencyList:data.convertToCurrencyList
    }

    return new Promise(function(resolve, reject){
        paypalSdk.convertCurrency(payload, function(err, response){
            if(err)
                reject({ err: err, response: response });
            else
                resolve(response);
        })
    });
}

//   paymentApprovalUrl: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=AP-52T82003CW727040R' }

// Pay Key AP-8FF81376T0890932E , AP-12298941FX308670D

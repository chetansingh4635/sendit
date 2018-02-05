var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = require('mongoose').Schema,
    bcrypt = require('bcryptjs'),
    plugins = require('../../../plugins'),
    autopopulate = require('mongoose-autopopulate');

// bcrypt password
var hashPass = function (value) {
    return bcrypt.hashSync(value);
}

// transform
var omitPrivate = function (doc, request) {
    return request;
};

// options
var options = {
    toJSON: { virtuals: true, transform: omitPrivate },
    timestamps: true
};

// schema
var schema = new Schema({
        createdBy: {type:Schema.Types.ObjectId, "ref": "User"},
        departingAirpoart: { type: String, trim: true },
        departingDate: {type: String, trim: true},
        arrivingAirpoart: {type: String, trim: true},
        arrivingDate: {type: String, trim: true},
        shipmentDetail:{
                item: {type: String, trim: true},
                quantity: {type: Number, trim: true}
        },
        recepientInformation:{
                firstName: {type: String, trim: true},
                lastName: {type: String, trim: true},
                email: {type: String, trim: true},
                phoneNumber: {type: String, trim: true}
        },
        userIntrested:[{
            userId: {type: Schema.Types.ObjectId, "ref" : "User"},
            requestId :{type: Schema.Types.ObjectId, "ref": "Request"},
            disscussionId: {type: Number}
        }],
        partner:[
            {
                userId:{type: Schema.Types.ObjectId, "ref": "User"},
                requestId :{type:Schema.Types.ObjectId, "ref":"Request"},
                paymentStatus: {type: String},
                payKey: {type:String},
                amount: {type: Number},
                partnerShipStatus: {type: Number}
            }],
        requestType: {type: Number},
        requestedItem: {type: String, trim: true},
        brand: {type: String, trim: true},
        model:{type: String, trim: true},
        link:{type: String, trim: true},

        isActive: {type: Boolean, default: true}

}, options);


// plugins
schema.plugin(plugins.mongooseFindPaginate);
schema.plugin(plugins.mongooseSearch, ['departingAirpoart', 'arrivingAirpoart', 'departingDate', 'arrivingDate', 'requestType']);

// autopopulate plugin
schema.plugin(autopopulate);

// // Schema hooks method
// schema.pre('save', function (next) {
//     this.fullName = _.isString(this.lastName) ? (this.firstName + ' ' + this.lastName) : this.firstName;
//     next();
// });

// model
module.exports = mongoose.model('Request', schema);

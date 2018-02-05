var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = require('mongoose').Schema,
    bcrypt = require('bcryptjs'),
    plugins = require('../../../plugins'),
    autopopulate = require('mongoose-autopopulate');

// transform
var omitPrivate = function (doc, schedule) {   
    delete schedule.id;
    delete schedule.__v;
    return schedule;
};

// options
var options = {
    toJSON: { virtuals: true, transform: omitPrivate }
};

// schema
var schema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    destinationCity: { type: String, trim: true },
    sourceCity: { type: String, trim: true },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date, default: new Date() },
    luggages: [{ type: Schema.Types.ObjectId, ref: 'Luggage' }],    
    createdAt: { type: Date, default: new Date() },
    weight: { type: String, trim: true },
    size: { type: String, trim: true },    
    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, options);

// plugins
schema.plugin(plugins.mongooseFindPaginate);
schema.plugin(plugins.mongooseSearch, ['destinationCity', 'sourceCity', 'startDate', 'endDate']);

// autopopulate plugin
schema.plugin(autopopulate);

// model
module.exports = mongoose.model('Schedule', schema);

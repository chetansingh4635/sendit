var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = require('mongoose').Schema,
    bcrypt = require('bcryptjs'),
    plugins = require('../../../plugins'),
    autopopulate = require('mongoose-autopopulate');

// transform
var omitPrivate = function (doc, luggage) {   
    delete luggage.id;
    delete luggage.__v;
    return luggage;
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
    createdAt: { type: Date, default: new Date() },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    image: { type: String, trim: true },
    description: { type: String, trim: true },
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
module.exports = mongoose.model('Luggage', schema);

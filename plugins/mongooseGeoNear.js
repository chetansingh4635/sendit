var _ = require('lodash')

// max number of items per page
var MAX_LIMIT = 10;

/**
 * Model static function for paginated version of Model.find().
 * Promise result is an object like: {skip:20, limit:10, total_count:100, hasPrev, hasNext, items:[{},{}], item_count: 2}
 * Also, items array in results contains "toJSON()" result of each document found and not the document itself. 
 * 
 * @param {Object} conditions - query conditions. Example: { age: { $gt: 20 } }
 * @param {Object} [options] - query options. Example: {skip: 20, limit: 10, sort: { name: 1, age: -1 } }
 */
function aggregatePaginate(conditions, options) {
	
    // Model class = this
    var Model = this;

    if (!_.has(options, 'latitude') || !_.has(options, 'longitude')) {
        throw new Error('options must have a latitude and longitude.');
    }
    
    // save fields to un-select , as they are marked with "select:false" in schema
    var omitFields = [];
    Model.schema.eachPath(function (p) {
        if (false == _.get(Model.schema.path(p), 'options.select', true)) {
            omitFields.push(p);
        }
    });

    // conditions object is required
    if (!_.isPlainObject(conditions)) {
        throw new Error('conditions must be a plain object.');
    }

    // get skip, limit and sort data
    var skip = _.isFinite(options.skip) ? Math.max(0, options.skip) : 0;
    var limit = _.isFinite(options.limit) ? options.limit : null;
    var sort = _.isPlainObject(options.sort) ? options.sort : null;

    if (sort) {
        // clean sort object to have only numerical values
        _.forOwn(sort, function (val, key) {
            if (!_.isFinite(val)) {
                delete sort[key];
            }
        });
    }

    // process query
    
    var query = Model.aggregate(
        [
            {
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [options.longitude, options.latitude]
                    },
                    "distanceField": 'dis',
                    "distanceMultiplier": .001,
                    "spherical": true,
                    "query": conditions
                }
            }
        ])
        .sort(sort)
        .skip(skip);
        
    // check limit is sent or not 
    if (limit) {
        query = query.limit(limit);
    }

    return query
        .exec()
        .then(function (cursor) {
            return Model.count(conditions)
                .then(function (num) {

                    // result object
                    var result = {
                        skip: skip,
                        limit: limit ? limit : num,
                        total_count: num,
                        items: cursor,
                        hasPrev: skip > 0,
                        hasNext: false
                    };
			
                    // emulate mongoose select:false and toJSON functions for items
                    result.items = result.items.map(function (item) {
				
                        // delete fields marked with "select:false" in schema
                        omitFields.forEach(function (f) { delete item[f]; });
				
                        // convert to document and transform using "toJSON()"
                        return (new Model(item)).toJSON();
                    });

                    // set item count
                    result.item_count = result.items.length;
                    result.hasNext = num > (result.item_count + skip);
                    return result;
                })
        });
};

/**
 * Mongoose Plugin to add a static method "aggregatePaginate()" to schema's Model.
 */
module.exports = function (schema) {
    schema.statics.aggregatePaginate = aggregatePaginate;
}
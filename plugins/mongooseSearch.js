var _ = require('lodash');

/**
 * Model static function for text search. Internally uses mongoose paginate plugin method "findPaginate()".
 * If no sort is provided in options, results are sorted based on search score.
 * callback result is an object like: {skip:20, limit:10,total_count:100, items:[{},{}], item_count: 2}
 * 
 * @param {String} searchText - text search string. Example: "new cars"
 * @param {Object} conditions - query conditions. Example: { age: { $gt: 20 } }
 * @param {Object} [options] - query options. Example: {skip: 20, limit: 10, sort: { name: 1, age: -1 } }
 * @param {function(Error,Object)} callback - callback function.
 */
function search(searchText, conditions, options) {

    // serach text must be provided, else better use findPaginate()
    if (!_.isString(searchText)) {
        throw new Error('searchText must be a string.');
    }

    // model
    var Model = this;
    
    // add text search to conditions
    //conditions['$text'] = { '$search': searchText };
    
    //conditions['$or'] = [];
    var orQuery = [];
    Model.schema.statics.searchFields.forEach(function (n) {
        var field = {};
        field[n] = new RegExp(searchText, 'i');
        orQuery.push(field);
    });
    
    // push search or condition in and query
    conditions['$and'] = _.has(conditions, '$and') ? conditions['$and'] : [];
    conditions['$and'].push({'$or':orQuery});
    
    // default sort by serach score, if no sort specified
    if (!_.has(options, 'sort')) {
        options.sort = { score: { '$meta': 'textScore' } };
    }

    // call find paginate or aggregate paginate
    return (!_.has(options, 'latitude')) ? Model.findPaginate(conditions, options) : Model.aggregatePaginate(conditions, options);
}


/**
 * Mongoose plugin that enables text search on models.
 * The plugin enables text indexing of given fields in schema and adds a static method "search()".
 * 
 * @param {Schema} schema - mongoose schema.
 * @param {String[]} fieldNames - array of field names on which text index is to be enabled.
 */
module.exports = function (schema, fieldNames) {

    // Mongoose Paginate plugin is required.
    if (!_.has(schema, 'statics.findPaginate') || !_.isFunction(schema.statics.findPaginate)) {
        throw new Error('findPaginate is not defined as static method on schema. Mongoose Paginate plugin is required.');
    }

    // field names must be an array of strings
    if (!_.isArray(fieldNames) || !_.every(fieldNames, _.isString)) {
        throw new Error('fieldNames must be an array of strings.');
    }

    // at least one field name is required
    if (fieldNames.length < 1) {
        throw new Error('fieldNames must have at least one field name.');
    }

    // text index fields
    var textIndex = {};
    fieldNames.forEach(function (n) {
        textIndex[n] = 'text';
    });

    // apply text index
    schema.index(textIndex);
    
    // add static field name on which search is perform.
    schema.statics.searchFields = fieldNames;
    
    // ass static method "search()" to schema
    schema.statics.search = search;
}
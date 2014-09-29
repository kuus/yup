var Clank = require('clank')
  , Field = require('./field')
  , DAOObject = require('./dataAccessObject')
  , fnName = require('fn-name')
  , fieldTypes = require('./fieldTypes')
  , Validation = require('./util/validators').validator
  , _ = require('lodash')
  
var Schema = module.exports = DAOObject.extend({

  constructor: function Schema(spec){
    if( arguments.length === 1)
      return this.constructor.create(spec)

    Clank.Object.call(this)
    this.errors = []
  },

  isValid: function(value) {
    var self = this
      , results;

    self.errors = []

    _.every(this.fields, function(field, key){
      var valid = field.isValid(value[key])
      if(!valid) self.errors = self.errors.concat(field.errors.slice())
      return valid
    })

    if (this.validate){
      results = this.validate(value)
      results && this.errors.push(results)
    }

    return !this.errors.length
  },

  default: function(){
    return _.transform(this.fields, function(o, field, key){
      return o[key] = field.default()
    })
  },

  defaultFor: function(field){
    return this.fields[field].default()
  },

  cast: function(inst){
    var fields = this.fields
      , isStrict = this.strict === true
      , props = _.union(_.keys(inst), _.keys(fields))

    return _.transform(props, function(obj, prop) {
      var exists = _.has(inst, prop);

      if( exists && fields[prop] )
          obj[prop] = fields[prop].cast(inst[prop])

      else if( exists && !isStrict )
          obj[prop] = inst[prop]

      else if(fields[prop])
        obj[prop] = fields[prop].default() 

    }, {})
  }

})


Schema.setCompositionStrategy({
  
  fields: new Clank.Descriptor(function(key, values) {
    var fields = _.extend.apply( _, [{}].concat(values) )

    return _.mapValues(fields, function(val, key) {
      var type = val
        , is = _.has(type, 'type')
        , options = {}

      if ( val instanceof Field || val instanceof Schema) 
        return val

      if (_.has(type, 'type') ){
        options = type
        type = type.type
      }

      var isArray =  type === Array || _.isArray(type)

      if( isArray ) {
        options.subField = fieldFromType(type[0], options)
        type = 'Array'
      }

      return fieldFromType(type, options)
    })
  })

})


function fieldFromType(type, options){
  //it's a schema
  if ( _.isPlainObject(type) ) { 
    var schema = type.fields ? type : { fields: type }
    return Schema.create(schema)
  }

  if ( !_.isString(type) && !_.isFunction(type) ) 
    throw new TypeError()

  options.type = type
  return fieldTypes[typeName(type)].create(options)
}

function typeName(type) {
  if (type == null) return 'Mixed'
  if ( typeof type === 'function') return fnName(type)
  return type || 'Custom'
}

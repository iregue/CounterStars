var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
 Schema = mongoose.Schema;

var observaciones = new Schema({
	location:
	{
		type:{type:String},
		coordinates:[Number]
	},
	fecha: Date
});

observaciones.plugin(mongoosePaginate);
observaciones.index({location: '2dsphere'});
module.exports = mongoose.model('Observaciones', observaciones);

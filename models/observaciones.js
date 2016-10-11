var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
 Schema = mongoose.Schema;

var observaciones = new Schema({
	latitud: Number,
	longitud: Number,
	fecha: String
});

observaciones.plugin(mongoosePaginate);
module.exports = mongoose.model('Observaciones', observaciones);

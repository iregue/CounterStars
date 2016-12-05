var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
Schema = mongoose.Schema;

var eventos = new Schema({
	name: String,
	description: String,
	star_date: Date,
	end_date: Date
});

observaciones.plugin(mongoosePaginate);
module.exports = mongoose.model('Evento', evento);

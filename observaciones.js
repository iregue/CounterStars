//'use strict'

const mongoose = require('mongoose'),
Schema= mongoose.Schema;

var observaciones = new Schema({
	latitud: Number,
	longitud: Number,
	fecha: String
});

module.exports = mongoose.model('Observaciones', observaciones);


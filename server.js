//'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var paginate = require('express-paginate');
var mongoose = require('mongoose');

var app = express();

var router = express.Router();
var port = process.env.PORT || 8888
const Observaciones = require('./models/observaciones');
//const Eventos = require('./models/eventos');
  app.use(bodyParser.urlencoded({ extended: true  }));
  app.use(bodyParser.json());
  app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
  app.use(paginate.middleware(50,50));
    
mongoose.connect('mongodb://starsdb:27017/observaciones',function(err,res){
if(err) console.log('Error:Conectando a la BD: '+ err);
	else console.log('Conexion a la BD correcta');
  app.listen(port, function(){
    console.log('API REST corriendo en localhost:'+ port)})
});

app.get('/', function(req,res) //request respuesta
{
	res.send('Hola mundo');
});

app.get('/api/observations?', function(req,res) //request respuesta
{
		//comprobacion del parametro page
		if(req.query.page ==null)
		{
			var pagina = 1;
			console.log('pagina por defecto');
		}
		else
		{
			var pagina = req.query.page;
			console.log('pagina establecida por parametro: '+ req.query.page);
		}
		//Comprobacion del limite deobjetos a mostrar por pagina
		if(req.query.limit!=null && req.query.limit < 51 && req.query.limit>-1)
		{
			var limite = req.query.limit;
			console.log('limite= '+limite);
		}
		else
		{
			var limite = 50;
			console.log('limite maximo 50');
		}

		//Comprobacion de campos solicitados
		if(req.query.fields!=null)
		{
			var str = req.query.fields;
			//var fields = req.query.fields, checkId = "id"
			var fields = str.replace(/,/g," ");
			//console.log(fields)
			checkId = "id";
			//comprueba si esta el atributo id como resultado
			if(fields.indexOf(checkId)!== -1)
				{
				console.log('id true');
				//var fields = req.query.fields +" -_id"
				}
			else
				{
				console.log('id false');
				//var fields = req.query.fields +" -_id"
				fields = fields +" -_id";
				//console.log(fields);
				}
		}

	//comprueba si hay que filtar parametros
	if(req.query.startdate || req.query.lon || req.query.lat || req.query.distance)
	{
		
		console.log('peticion con campos');
		console.log(req.query.startdate);
		

		//Si contiene hora de inicio, se comprueba si existe hora final, para en caso contrario añadir como hora final,
		//la hora actual
		if(req.query.startdate)
		{
			if(req.query.enddate)
			{
				 var end_date = req.query.enddate;
			}
			else
			{
				//Se establece como fecha final, la actual del servidor
				var end_date =  new Date().toISOString();
				console.log('fecha final creada: '+ end_date);
			}
		}

		//Se comprueba que existan todos los parametros para filtrar mediante una localizacion.
		var location_ok = false;
		var filtra_lat = false;
		var filtra_lon = false;
		if(req.query.lon || req.query.lat || req.query.distance)
		{
			if(!req.query.lon || !req.query.lat)
			{
				if(!req.query.distance || (!req.query.lon && !req.query.lat))
				{
					return res.send('{Error: Miss parameter}')
				}
				else
				{
					if(req.query.lat)
					{
						var lat_bigger = Number(req.query.lat) - Number(req.query.distance);
						var lat_less = Number(req.query.lat) + Number(req.query.distance);
						filtra_lat = true;
						console.log('Filtrado por latitudes');
						console.log('lat_bigger : '+lat_bigger);
						console.log('lat_less : '+lat_less);
					}
					else
					{
						var lon_bigger = Number(req.query.lon) - Number(req.query.distance);
						var lon_less = Number(req.query.lon) + Number(req.query.distance);
						filtra_lon = true;
						console.log('Filtrado por longitud');
						console.log('lon_bigger : '+lon_bigger);
						console.log('lon_less : '+lon_less);
					}
				}
			}
			else
			{
				if(req.query.distance)
				{
					//Se recibe el radio en kilometros y se pasa a radianes
					var distance_km = req.query.distance/6371;
					console.log('distacia en radianes: '+ distance_km);
					location_ok = true;
				}
				else
				{
					distance_km = 0;
					console.log('distacia en radianes: '+ distance_km);
					location_ok = true;
				}
			}
		}

		//Filtrado por fecha y localización
		if(req.query.startdate && location_ok)
		{
			console.log('startdate y location ok');
			
			Observaciones.paginate({date: {$gte: req.query.startdate, $lt:end_date},
									location: 
									{
										$nearSphere:[req.query.lat,req.query.lon],
										$maxDistance: distance_km
									}
									}, {page: pagina, limit: limite, select:fields}, function(err,observaciones){
				if(err)
				{
					return next(err);
				}

				return res.send(observaciones);
			});

		}
		if(req.query.startdate && !location_ok && !filtra_lat && !filtra_lon)
		{
			console.log('startdate y no location ok');
			Observaciones.paginate({date: {$gte: req.query.startdate, $lt:end_date}},
							{page: pagina, limit: limite, select:fields}, function(err,observaciones){
					if(err)
					{
						return next(err);
					}
					return res.send(observaciones);
				});
		}
		if(location_ok && !req.query.startdate)
		{
			console.log('no startdate y location ok');
			Observaciones.paginate({location: 
									{
										$nearSphere:[req.query.lat,req.query.lon],
										$maxDistance: distance_km
									}
									}, {page: pagina, limit: limite, select:fields}, function(err,observaciones){
				if(err)
				{
					return next(err);
				}

				return res.send(observaciones);
			});
		}
		if(req.query.startdate && filtra_lat)
		{
			console.log("filtrado por fecha y latitud");
			Observaciones.paginate({date: {$gte: req.query.startdate, $lt:end_date},
				"location.coordinates.0":{$gte: lat_bigger, $lt:lat_less}},
				{page: pagina, limit: limite, select:fields}, function(err,observaciones)
				{
				if(err)
				{
					return next(err);
				}
				return res.send(observaciones);
				});
		}
		if(!req.query.startdate && filtra_lat)
		{
			console.log("filtrado latitud y !fecha");
			Observaciones.paginate({"location.coordinates.0":{$gte: lat_bigger, $lt:lat_less}},
				{page: pagina, limit: limite, select:fields}, function(err,observaciones)
				{
				if(err)
				{
					return next(err);
				}
				return res.send(observaciones);
				});
		}
		if(req.query.startdate && filtra_lon)
		{
			console.log("filtrado por fecha y longitud");
			Observaciones.paginate({date: {$gte: req.query.startdate, $lt:end_date},
				"location.coordinates.1":{$gte: lon_bigger, $lt:lon_less}},
				{page: pagina, limit: limite, select:fields}, function(err,observaciones)
				{
				if(err)
				{
					return next(err);
				}
				return res.send(observaciones);
				});
		}
		if(!req.query.startdate && filtra_lon)
		{
			console.log("filtrado por !fecha y longitud");
			Observaciones.paginate({"location.coordinates.1":{$gte: lon_bigger, $lt:lon_less}},
				{page: pagina, limit: limite, select:fields}, function(err,observaciones)
				{
				if(err)
				{
					return next(err);
				}
				return res.send(observaciones);
				});
		}
	}
	else
	{
		console.log('peticion sin campos');

			Observaciones.paginate({/*"location.coordinates.0":2.12378*/}, {page: pagina, limit: limite, select:fields}, function(err,observaciones)
			{
				if(err)
				{
					return next(err);
				}
				res.send(observaciones);
			});
	}
});

app.get('/api/observations/:observacionId', function(req,res) //request respuesta
{
  Observaciones.findById(req.params.observacionId, function(err, observacion)
{
  if(err) return res.status(500).send('Error al realizar la peticion: '+ err)
  //if(!observacion) return res.status(404).send('La observacion no existe ')

  res.status(200).json(observacion)
})
	//res.send('Prueba correcta2 '+ req.params.name);
});

app.post('/api/observations', function(req,res) //request respuesta
{
  console.log('POST /api/post');
  //Comprobacion parametro de POST correctos
  	if(!req.body.lon ||!req.body.lat || req.body.country)
	  {
	  	res.status(406).send('{Location Error: longitude as log and latitude as lat required country as a country}');
	  }
	  else
	  {
	  console.log(req.body);
	  var isoDate = new Date().toISOString();

	  var observacion = new Observaciones();
	  observacion.location = { type:"Point",coordinates:[req.body.lat,req.body.lon]},
	  //observacion.location.longitude = req.body.location,
	  //observacion.longitud = req.body.longitud,
	  observacion.date = isoDate;
	  observacion.user = "DefaultUser";
	  observacion.country = req.body.country;
	  observacion.event = "Gemenidas16";

	  observacion.save(function(err, observacion){
	    if(!err)
	    {
	     console.log('Observacion guardada');
	     console.log(observacion);
	     res.status(200).json(observacion);
	     //res.status(200);
	   }
	    else
	    {

	      console.log(err);
	      res.status(500).send(err.message);
	    }

	  });
	}
	//res.send('Prueba correcta '+ observacion);
});
//app.require('./routes');

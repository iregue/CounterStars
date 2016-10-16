//'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var paginate = require('express-paginate');
var mongoose = require('mongoose');

var app = express();

var router = express.Router()
var port = process.env.PORT || 8888
const Observaciones = require('./models/observaciones');
  app.use(bodyParser.urlencoded({ extended: true  }))
  app.use(bodyParser.json())
  app.use(paginate.middleware(50,50));
    //app.use(express.methodOverride());
    //app.use(express.router);

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

app.get('/api/observaciones?', function(req,res) //request respuesta
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
	//comprueba si hay que filtar parametros
	if(req.query.fields || req.query.startdate || req.query.enddate || req.query.latitude || req.query.longitude)
	{
		
		console.log('peticion con campos');
		console.log(req.query.startdate);
		//Comprobacion de campos solicitados
		if(req.query.fields!=null)
		{
			var fields = req.query.fields, checkId = "id"
			
			//comprueba si esta el atributo id como resultado
			if(fields.indexOf(checkId)!== -1)
				{
				console.log('id true');
				//var fields = req.query.fields +" -_id"
				}
			else
				{
				console.log('id false');
				var fields = req.query.fields +" -_id"
				}
		}

		if(req.query.startdate && req.query.enddate)
		{
			console.log('startdate y enddate');
			
			Observaciones.paginate({fecha: {$gte: req.query.startdate, $lt:req.query.enddate}}, {page: pagina, limit: limite}, function(err,observaciones){
				if(err)
				{
					return next(err);
				}
				res.send(observaciones);
			});
			/*Observaciones.find({fecha: {$gte: req.query.startdate, $lt:req.query.enddate}},fields,function(err,observaciones)
		{
			if(err) return next(err);
			res.send(observaciones);
			
		});*/
		}
		if(req.query.startdate && req.query.enddate==null)
		{
			console.log('startdate');
			
			Observaciones.paginate({fecha: {$gte: req.query.startdate}}, {page: pagina, limit: limite}, function(err,observaciones){
				if(err)
				{
					return next(err);
				}
				res.send(observaciones);
			});
		}
		if(req.query.latitude)
		{

		}
		if(req.query.longitude)
		{

		}
		console.log(fields);
/*fecha: {$gte: "2016-10-14T13:46:53.007Z", $lt:"2016-10-14T13:46:54.007Z"}*/
/*fecha: {$gte: req.query.startdate, $lt:req.query.enddate}*/
		/*Observaciones.geoNear([req.query.longitude, req.query.latitude],
		{
			near: [2.12376, -1.3123],
			maxDistance: 1,
			spherical:true},
			function(err,results){
				console.log(results);
		});*/
		/*Observaciones.find({fecha: {$gte: req.query.startdate, $lt:req.query.enddate}},fields,function(err,observaciones)
		{
			if(err) return next(err);
			res.send(observaciones);
			
		});*/
	}
	else
	{
		console.log('peticion sin campos');

			Observaciones.paginate({}, {page: pagina, limit: limite}, function(err,observaciones){
				if(err)
				{
					return next(err);
				}
				res.send(observaciones);
			});
	}
});
/*
  Observaciones.find(function(err, observaciones)
{
  if(err)
  {
  res.send(err);
  }
  res.json(observaciones);

}).limit(20);
	//res.send('Prueba correcta1 '+ req.params.name);
});*/
/*
app.get('/api/observaciones/', function(req,res) //request respuesta
{
  var q = Observaciones.GET.find({published: false}).sort({'date': -1}).limit(20);
  q.exec(function(err, observaciones)
{
  if(err)
  {
    res.send(err);
  }
  res.json(observaciones);


});
	//res.send('Prueba correcta1 '+ req.params.name);
});*/
/*
app.get('/api/observaciones/', function(req,res,next) //request respuesta
{
  Observaciones.paginate({},{
    page: req.query.page,
    limit:req.query.limit,
  },function(err,observaciones, pageCount, itemCount)
{
  if(err)
  {
  res.send(err);
  }
  res.format({
    html: function(){
      res.render('observaciones',{
        observaciones: observaciones,
        pageCount:pageCount,
        itemCount: itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)

      });
    },
    json:function(){
      res.json({
        object:'list',
        has_more:paginate.hasNextPages(req)(pageCount),
        data:observaciones
      });
    }
  });

});
	//res.send('Prueba correcta1 '+ req.params.name);
});
*/
app.get('/api/observaciones/:observacionId', function(req,res) //request respuesta
{
  Observaciones.findById(req.params.observacionId, function(err, observacion)
{
  if(err) return res.status(500).send('Error al realizar la peticion: '+ err)
  //if(!observacion) return res.status(404).send('La observacion no existe ')

  res.status(200).json(observacion)
})
	//res.send('Prueba correcta2 '+ req.params.name);
});

app.post('/api/observaciones', function(req,res) //request respuesta
{
  console.log('POST /api/post');
  console.log(req.body);
  var isoDate = new Date().toISOString();

  var observacion = new Observaciones();

  observacion.latitud = req.body.latitud,
  observacion.longitud = req.body.longitud,
  observacion.fecha = isoDate

  observacion.save(function(err, observacion){
    if(!err)
    {
     console.log('Observacion guardada');
     console.log(observacion);
     res.status(200).json(observacion)

   }
    else
    {

      console.log(err);
      res.status(500).send(err.message);
    }

  });
	//res.send('Prueba correcta '+ observacion);
});
//app.require('./routes');

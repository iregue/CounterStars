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
  app.use(paginate.middleware(10,50));
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

app.get('/api/observaciones/', function(req,res) //request respuesta
{
  Observaciones.find(function(err, observaciones)
{
  if(err)
  {
  res.send(err);
  }
  res.json(observaciones);

}).limit(20);
	//res.send('Prueba correcta1 '+ req.params.name);
});
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

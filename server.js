const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const { getMongoDb } = require('./db');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configuración de la base de datos MySQL
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "finalproject",
});

mysqlConnection.connect((err) => {
  if (err) {
    console.error("Error de conexión a MySQL:", err.message);
  } else {
    console.log("Conectado a MySQL");
  }
});

// Middleware para habilitar CORS (acceso desde el frontend)
app.use(cors());
app.use(bodyParser.json());

// Ruta para obtener todos los productos
app.get('/productos', (req, res) => {
  mysqlConnection.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener productos" });
    }
    res.status(200).json(results); // Enviamos los productos al frontend
  });
});

app.get('/sucursales', (req, res) => {
  mysqlConnection.query('SELECT * FROM sucursales', (err, results) => {
    if(err){
      return res.status(500).json({error: "Error al obtener sucursales"});
    }
    res.status(200).json(results);
  });
});

// Ruta para obtener un producto por su ID
app.get('/producto/:id_producto', (req, res) => {
    const id_producto = req.params.id_producto; // Obtenemos el id del parámetro de la URL
  
    const query = 'SELECT * FROM productos WHERE id_producto = ?'; // Consulta SQL
    mysqlConnection.query(query, [id_producto], (err, results) => {
      if (err) {
        console.error('Error al obtener el producto:', err);
        return res.status(500).send('Error al obtener el producto');
      }
  
      if (results.length === 0) {
        return res.status(404).send('Producto no encontrado');
      }
  
      res.status(200).json(results[0]); // Enviamos el producto al frontend
    });
  });
  
// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json()); // Para solicitudes JSON
app.use(express.urlencoded({ extended: true })); // Para solicitudes URL encoded

// Ruta para procesar la compra
app.post('/comprar/:id_producto', (req, res) => {
    const { cantidad } = req.body;
    const id_producto = req.params.id_producto;
    const stock = req.params.stock;
  
    // Primero, obtenemos el producto para verificar el stock
    mysqlConnection.query('SELECT * FROM productos WHERE id_producto = ?', [id_producto], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ error: "Producto no encontrado" });
      }
  
      const producto = results[0];
      if (producto.stock < cantidad) {
        return res.status(400).json({ error: "No hay suficiente stock" });
      }

      data = mysqlConnection.query('SELECT stock FROM productos WHERE id_producto = ?', [id_producto], (err, results) => {
        if(err){
          return res.status(500).data({error: "Error al consultar stock"});
        }
      })
  
      // Actualizamos el stock
      const nuevoStock = producto.stock - cantidad;
      mysqlConnection.query('UPDATE productos SET stock = ? WHERE id_producto = ?', [nuevoStock, id_producto], (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error al actualizar el stock" });
        }
        res.status(200).json({ success: "Compra procesada correctamente" });
      });
    });
  });
  
  app.post('/comentarios/:id_producto', (req, res) => {
    const { id_producto } = req.params;
    const { autor, contenido } = req.body;
  
    // Aquí puedes guardar el comentario en la base de datos, por ahora simularemos la operación.
    console.log(`Comentario recibido para el producto ${id_producto}:`);
    console.log(`Autor: ${autor}`);
    console.log(`Contenido: ${contenido}`);
  
    // Respuesta simulada
    res.status(200).json({ mensaje: 'Comentario publicado exitosamente', id_producto, autor, contenido });
  });
  
  // Iniciar servidor
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
  
  // Ruta para obtener comentarios de un producto
  app.get('/comentarios/:id_producto', async (req, res) => {
    const id_producto = parseInt(req.params.id_producto, 10);

    if (isNaN(id_producto)) {
        return res.status(400).json({ error: "El ID del producto debe ser un número válido" });
    }

    try {
        const db = await getMongoDb();
        const comentariosCollection = db.collection('comentarios');
        const comentarios = await comentariosCollection.find({ id_producto }).toArray();
        res.status(200).json(comentarios);
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        res.status(500).json({ error: "Error al obtener comentarios" });
    }
});

app.post('/calificar', async (req, res) => {
  const { id_producto, calificacion } = req.body;
  try {
    const nuevaCalificacion = new Calificacion({ id_producto, calificacion });
    await nuevaCalificacion.save();
    
    // Calcular el nuevo promedio de calificación
    const calificaciones = await Calificacion.find({ id_producto });
    const promedio = calificaciones.reduce((sum, cal) => sum + cal.calificacion, 0) / calificaciones.length;

    // Actualizar el promedio de la calificación del producto en la base de datos
    await Producto.findByIdAndUpdate(id_producto, { promedio_calificacion: promedio });

    res.status(200).send({ mensaje: 'Calificación guardada y promedio actualizado', promedio });
  } catch (error) {
    res.status(500).send({ error: 'Error al calificar el producto' });
  }
});


const mongoose = require('mongoose');

const calificacionSchema = new mongoose.Schema({
  id_producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  calificacion: { type: Number, min: 1, max: 5, required: true },
});

const Calificacion = mongoose.model('Calificacion', calificacionSchema);

module.exports = Calificacion;


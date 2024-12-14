const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Para permitir que el frontend se conecte al backend

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
  
  

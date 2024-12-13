const mysql = require('mysql2');
const { MongoClient } = require('mongodb');

// Configuración de MySQL
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'finalproject',
});

// Configuración de MongoDB
const mongoUri = 'mongodb+srv://root:12345@clustergratis.nxzp2.mongodb.net/';
const client = new MongoClient(mongoUri);

async function connectMySQL() {
  return new Promise((resolve, reject) => {
    mysqlConnection.connect((err) => {
      if (err) {
        reject("Error de conexión a MySQL: " + err.message);
      } else {
        resolve("Conectado a MySQL");
      }
    });
  });
}

async function connectMongo() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
  } catch (err) {
    console.error("Error de conexión a MongoDB:", err.message);
  }
}

async function getMongoDb() {
  const db = client.db("TiendaJoyas");
  return db;
}

module.exports = { mysqlConnection, connectMySQL, connectMongo, getMongoDb };

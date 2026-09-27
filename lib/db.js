const { MongoClient } = require('mongodb');

// The client is cached on the module so warm serverless invocations reuse the connection.
let clientPromise = global._mongoClientPromise;

function getClient() {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    clientPromise = new MongoClient(uri, { maxPoolSize: 5 }).connect();
    global._mongoClientPromise = clientPromise;
  }
  return clientPromise;
}

async function rsvps() {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB || 'wedding').collection('rsvps');
}

module.exports = { rsvps };

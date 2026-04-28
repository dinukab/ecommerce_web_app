import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const findInAllDBs = async () => {
  const mongoURI = (process.env.MONGODB_URI || process.env.MONGO_URI || '').replace(/\/oneshop_open_door/, '/');
  try {
    const client = await mongoose.connect(mongoURI);
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    
    for (const dbInfo of dbs.databases) {
      if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
      
      console.log(`\n=== Database: ${dbInfo.name} ===`);
      const db = mongoose.connection.useDb(dbInfo.name).db;
      const collections = await db.listCollections().toArray();
      
      for (const col of collections) {
        const doc = await db.collection(col.name).findOne({
          $or: [
            { storeName: 'Open Door' },
            { storeId: '69e539fd180ff885ce56ca57' },
            { logoUrl: { $exists: true } },
            { logo: { $exists: true } }
          ]
        });
        
        if (doc) {
          console.log(`Found relevant doc in collection: ${col.name}`);
          console.log(JSON.stringify(doc, (key, value) => {
              if (value && value.buffer) return `[Buffer ${value.length}]`;
              if (typeof value === 'string' && value.length > 100) return value.substring(0, 100) + '...';
              return value;
          }, 2));
        }
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

findInAllDBs();

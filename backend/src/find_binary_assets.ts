import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const findBinary = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoURI!);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const doc = await db.collection(col.name).findOne({
        $or: [
          { image: { $type: 'binData' } },
          { logo: { $type: 'binData' } },
          { data: { $type: 'binData' } },
          { content: { $type: 'binData' } },
          { fileData: { $type: 'binData' } }
        ]
      });
      if (doc) {
          console.log(`Found binary data in collection: ${col.name}`);
          // Print sample of keys and sizes
          for (const key in doc) {
              if (doc[key] && doc[key]._bsontype === 'Binary') {
                  console.log(`  ${key}: Binary, size ${doc[key].length()} bytes`);
              }
          }
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

findBinary();

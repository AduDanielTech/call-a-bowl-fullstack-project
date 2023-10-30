const admin = require('firebase-admin');
const NodeCache = require('node-cache'); // You'll need to install this package

const serviceAccount = require('./ignore/website-cd6ce-firebase-adminsdk-qbvxq-fdc8191376.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://website-cd6ce-default-rtdb.firebaseio.com",
});

class Repository {
  constructor(collectionName) {
    if (!collectionName) {
      throw new Error('Creating a repository requires a collection name');
    }
    this.collectionName = collectionName;
    this.collectionRef = admin.database().ref(collectionName);
    this.cache = new NodeCache(); // Initialize a cache
  }

  async create(attrs) {
    // Create a new record in Firebase
    const newRecordRef = this.collectionRef.push(attrs);
    const newRecordSnapshot = await newRecordRef.once('value');
    const newRecord = newRecordSnapshot.val();

    // Invalidate the cache
    this.cache.del(this.collectionName);

    return newRecord;
  }

  async getAll() {
    // Check if the data is already in the cache
    const cachedData = this.cache.get(this.collectionName);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch data from Firebase
    const recordsSnapshot = await this.collectionRef.once('value');
    const records = recordsSnapshot.val() || {};

    // Store the data in the cache with a specific TTL (time to live)
    this.cache.set(this.collectionName, records, 3600); // Cache for 1 hour (adjust as needed)

    return records;
  }
  async delete(id) {
    // Delete a record in Firebase
    const recordRef = this.collectionRef.child(id);
    await recordRef.remove();
  
    // Invalidate the cache
    this.cache.del(this.collectionName);
  }
  
  async update(id, attrs) {
    // Update a record in Firebase
    const recordRef = this.collectionRef.child(id);
    await recordRef.update(attrs);
  
    // Invalidate the cache
    this.cache.del(this.collectionName);
  }
  
  // Implement caching for other methods like getOne, getOneTitle, and getOneBy
  
  async getOne(id) {
    // Check if the data is already in the cache
    const cachedData = this.cache.get(id);
    if (cachedData) {
      return cachedData;
    }
  
    // If not in cache, fetch data from Firebase
    const recordRef = this.collectionRef.child(id);
    const recordSnapshot = await recordRef.once('value');
    const record = recordSnapshot.val();
  
    // Store the data in the cache with a specific TTL
    if (record) {
      this.cache.set(id, record, 3600); // Cache for 1 hour (adjust as needed)
    }
  
    return record;
  }
  
  async getOneTitle(title) {
    // Check if the data is already in the cache
    const cachedData = this.cache.get(title);
    if (cachedData) {
      return cachedData;
    }
  
    // If not in cache, fetch data from Firebase and filter by title
    const records = await this.getAll();
    const filteredRecords = records.filter((record) =>
      record.title.toLowerCase().includes(title.toLowerCase())
    );
  
    // Store the filtered data in the cache with a specific TTL
    this.cache.set(title, filteredRecords, 3600); // Cache for 1 hour (adjust as needed)
  
    return filteredRecords;
  }
  
  async getOneBy(filters) {
    // Check if the data is already in the cache
    const cacheKey = JSON.stringify(filters);
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  
    // If not in cache, fetch data from Firebase
    const records = await this.getAll();
  
    const filteredRecord = records.find((record) => {
      let found = true;
      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
          break;
        }
      }
      return found;
    });
  
    // Store the data in the cache with a specific TTL
    if (filteredRecord) {
      this.cache.set(cacheKey, filteredRecord, 3600); // Cache for 1 hour (adjust as needed)
    }
  
    return filteredRecord;
  }
}
  
  module.exports = Repository;
  
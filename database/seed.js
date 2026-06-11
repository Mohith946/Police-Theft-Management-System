// Dynamically resolve modules from the server directory
const path = require('path');
module.paths.push(path.resolve(__dirname, '../server/node_modules'));

// Load environment variables from server/.env
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection URI - Default to Docker local or custom env
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://mohithla24_db_user:JP4QHTRqyUR94CZ4@documents.p2i1fcz.mongodb.net/police_theft_db?retryWrites=true&w=majority';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected successfully.');

    const db = mongoose.connection.db;

    // Drop existing collections to start fresh
    console.log('Cleaning existing collections...');
    const collections = await db.listCollections().toArray();
    for (const coll of collections) {
      await db.collection(coll.name).drop();
      console.log(`Dropped collection: ${coll.name}`);
    }

    // Hash password for default users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Seed Users
    console.log('Seeding Users...');
    const usersCollection = db.collection('users');
    const userDocs = [
      {
        username: 'admin',
        email: 'admin@police.gov',
        passwordHash: passwordHash,
        role: 'admin',
        badgeNumber: 'BADGE-001',
        status: 'approved',
        createdAt: new Date()
      },
      {
        username: 'officer1',
        email: 'officer1@police.gov',
        passwordHash: passwordHash,
        role: 'officer',
        badgeNumber: 'BADGE-102',
        status: 'approved',
        createdAt: new Date()
      },
      {
        username: 'officer2',
        email: 'officer2@police.gov',
        passwordHash: passwordHash,
        role: 'officer',
        badgeNumber: 'BADGE-205',
        status: 'approved',
        createdAt: new Date()
      }
    ];
    const insertedUsers = await usersCollection.insertMany(userDocs);
    console.log(`Inserted ${insertedUsers.insertedCount} users.`);

    // 2. Seed Criminals
    console.log('Seeding Criminals...');
    const criminalsCollection = db.collection('criminals');
    const criminalDocs = [
      {
        name: 'Marcus Vane',
        aliases: 'Slick Marcus, Shadow',
        dateOfBirth: new Date('1988-04-12'),
        gender: 'male',
        physicalFeatures: {
          height: 178,
          weight: 70,
          hairColor: 'black',
          eyeColor: 'brown',
          scars: 'scar on left jawline',
          tattoos: 'scorpion on neck'
        },
        lastKnownLocation: '123 Downtown Alley, Cityville',
        photoUrl: null,
        status: 'active',
        createdAt: new Date()
      },
      {
        name: 'Sarah Jenkins',
        aliases: 'Cat Burglar, Whisper',
        dateOfBirth: new Date('1995-09-22'),
        gender: 'female',
        physicalFeatures: {
          height: 165,
          weight: 55,
          hairColor: 'blonde',
          eyeColor: 'blue',
          scars: 'none',
          tattoos: 'butterfly on right wrist'
        },
        lastKnownLocation: '45 Harbor View, Cityville',
        photoUrl: null,
        status: 'active',
        createdAt: new Date()
      },
      {
        name: 'Raymond Holt',
        aliases: 'Iron Fist, Raymond',
        dateOfBirth: new Date('1979-12-05'),
        gender: 'male',
        physicalFeatures: {
          height: 190,
          weight: 105,
          hairColor: 'bald',
          eyeColor: 'brown',
          scars: 'burn scar on right shoulder',
          tattoos: 'anchor on bicep'
        },
        lastKnownLocation: '99 Industrial Park, Cityville',
        photoUrl: null,
        status: 'incarcerated',
        createdAt: new Date()
      }
    ];
    const insertedCriminals = await criminalsCollection.insertMany(criminalDocs);
    console.log(`Inserted ${insertedCriminals.insertedCount} criminals.`);

    // Get mapped IDs to create relationships
    const adminId = insertedUsers.insertedIds[0];
    const officer1Id = insertedUsers.insertedIds[1];

    const marcusId = insertedCriminals.insertedIds[0];
    const sarahId = insertedCriminals.insertedIds[1];



    // 3. Seed Complaints
    console.log('Seeding Complaints...');
    const complaintsCollection = db.collection('complaints');
    const complaintDocs = [
      {
        complaintNumber: 'COMP-2026-001',
        title: 'Stolen Luxury Sedan',
        description: 'Black BMW 5 Series parked outside residence was stolen overnight. Left window shattered.',
        category: 'vehicle',
        theftDate: new Date('2026-06-01T02:30:00Z'),
        theftLocation: '12 Main Street, Cityville',
        status: 'pending',
        reportedBy: officer1Id,
        reporterName: 'John Doe',
        reporterContact: '+1-555-0199',
        qrCodeToken: 'QR-COMP-BMW5-9831',
        createdAt: new Date()
      },
      {
        complaintNumber: 'COMP-2026-002',
        title: 'High-end Laptop Theft',
        description: 'MacBook Pro stolen from coffee shop while reporter went to the restroom.',
        category: 'electronics',
        theftDate: new Date('2026-06-03T14:15:00Z'),
        theftLocation: 'Star Cafe, Downtown',
        status: 'investigating',
        reportedBy: officer1Id,
        reporterName: 'Jane Miller',
        reporterContact: '+1-555-0145',
        qrCodeToken: 'QR-COMP-MBP16-1029',
        createdAt: new Date()
      },
      {
        complaintNumber: 'COMP-2026-003',
        title: 'Diamond Necklace Snatched',
        description: 'Suspect snatched a gold diamond necklace from victim\'s neck and fled on a black motorbike.',
        category: 'jewelry',
        theftDate: new Date('2026-06-04T10:00:00Z'),
        theftLocation: 'Market Square, Cityville',
        status: 'pending',
        reportedBy: adminId,
        reporterName: 'David Lee',
        reporterContact: '+1-555-0177',
        qrCodeToken: 'QR-COMP-DIA-5512',
        createdAt: new Date()
      }
    ];
    const insertedComplaints = await complaintsCollection.insertMany(complaintDocs);
    console.log(`Inserted ${insertedComplaints.insertedCount} complaints.`);

    const comp1Id = insertedComplaints.insertedIds[0];
    const comp2Id = insertedComplaints.insertedIds[1];
    const comp3Id = insertedComplaints.insertedIds[2];

    await complaintsCollection.createIndex({ complaintNumber: 1 }, { unique: true });
    await complaintsCollection.createIndex({ qrCodeToken: 1 }, { unique: true });
    console.log('Created indices on complaints.');

    // 4. Seed Stolen Items
    console.log('Seeding Stolen Items...');
    const stolenItemsCollection = db.collection('stolenitems');
    const stolenDocs = [
      {
        complaintId: comp1Id,
        itemName: 'BMW 5 Series',
        category: 'vehicle',
        description: 'Black, Model 2023, Plate: City-4592',
        serialNumber: 'VIN-BMW52023XYZ89',
        estimatedValue: 55000.00,
        qrCodeToken: 'QR-ITEM-BMW5-9831',
        status: 'stolen',
        recoveredDate: null,
        recoveryLocation: null,
        createdAt: new Date()
      },
      {
        complaintId: comp2Id,
        itemName: 'Apple MacBook Pro 16',
        category: 'electronics',
        description: 'Space Grey, 32GB RAM, 1TB SSD, sticker of a rocket on lid',
        serialNumber: 'C02F2345Q05D',
        estimatedValue: 2499.00,
        qrCodeToken: 'QR-ITEM-MBP16-1029',
        status: 'stolen',
        recoveredDate: null,
        recoveryLocation: null,
        createdAt: new Date()
      },
      {
        complaintId: comp3Id,
        itemName: '18k Gold Diamond Necklace',
        category: 'jewelry',
        description: 'Gold chain with a teardrop diamond pendant, approx 2 carats',
        serialNumber: 'CERT-DIA-99238',
        estimatedValue: 8500.00,
        qrCodeToken: 'QR-ITEM-DIA-5512',
        status: 'stolen',
        recoveredDate: null,
        recoveryLocation: null,
        createdAt: new Date()
      }
    ];
    const insertedStolen = await stolenItemsCollection.insertMany(stolenDocs);
    console.log(`Inserted ${insertedStolen.insertedCount} stolen items.`);
    await stolenItemsCollection.createIndex({ qrCodeToken: 1 }, { unique: true });
    console.log('Created index on stolen items.');

    // 5. Seed Match Results
    console.log('Seeding Match Results...');
    const matchResultsCollection = db.collection('matchresults');
    const matchDocs = [
      {
        complaintId: comp1Id,
        criminalId: marcusId,
        matchScore: 85.50,
        matchReason: 'High category overlap. Suspect Marcus Vane operates in Downtown (near theft location) and has prior vehicle theft allegations.',
        status: 'pending',
        createdAt: new Date()
      },
      {
        complaintId: comp3Id,
        criminalId: sarahId,
        matchScore: 72.00,
        matchReason: 'Victim description matches physical profile (height/gender) of Sarah Jenkins. Theft area overlaps with suspect\'s known operating radius.',
        status: 'pending',
        createdAt: new Date()
      }
    ];
    await matchResultsCollection.insertMany(matchDocs);
    console.log('Seeding completed successfully.');

    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

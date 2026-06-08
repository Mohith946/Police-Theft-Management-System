/**
 * MongoDB Schema Configuration & Index Documentation
 * 
 * This file serves as a reference for database validation schemas and indexes.
 * The active models are defined inside the server/models/ directory.
 */

module.exports = {
  dbName: 'police_theft_db',
  
  collections: {
    users: {
      indexes: [
        { fields: { username: 1 }, options: { unique: true } },
        { fields: { email: 1 }, options: { unique: true } }
      ]
    },
    criminals: {
      indexes: [
        { fields: { name: 1 }, options: {} },
        { fields: { location: '2dsphere' }, options: {} }
      ]
    },
    complaints: {
      indexes: [
        { fields: { complaintNumber: 1 }, options: { unique: true } },
        { fields: { location: '2dsphere' }, options: {} }
      ]
    },
    stolenitems: {
      indexes: [
        { fields: { qrCodeToken: 1 }, options: { unique: true } },
        { fields: { complaintId: 1 }, options: {} }
      ]
    },
    matchresults: {
      indexes: [
        { fields: { complaintId: 1, criminalId: 1 }, options: { unique: true } },
        { fields: { matchScore: -1 }, options: {} }
      ]
    }
  }
};

 const mongoclient = require('mongodb').MongoClient
     // const { MongoClient } = require("mongodb").MongoClient;
 const state = {
     db: null
 }

 module.exports.connect = function(done) {
     const url = 'mongodb://localhost:27017'
     const dbname = 'Electra'
         //create connection
     mongoclient.connect(url,{ useUnifiedTopology: true }, (err, data) => {
         if (err)
             return done(err)
         state.db = data.db(dbname)
         done()
     })


 }

 module.exports.get = function() {
     return state.db
 }
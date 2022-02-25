const mongoclient = require('mongodb').MongoClient
require('dotenv').config();

// const { MongoClient } = require("mongodb").MongoClient;
const state = {
    db: null
}
const pass = process.env.PASSWORD_DB
const dbname = process.env.DB_NAME
module.exports.connect = function (done) {
    const url = `mongodb+srv://mahroofali:${pass}@cluster0.omtn0.mongodb.net/${dbname}?retryWrites=true&w=majority`
    //create connection
    mongoclient.connect(url, { useUnifiedTopology: true }, (err, data) => {
        if (err)
            return done(err)
        state.db = data.db(dbname)
        done()
    })

}

module.exports.get = function () {
    return state.db
}
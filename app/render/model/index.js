const Sequelize = require('sequelize');
const path = require('path');
const config = require('../../config');
const fs = require('fs');

const sequelize = new Sequelize('GrieverDB', null, null, {
    dialect: 'sqlite',
    storage: path.resolve(config.configPath, "store.db")
})

const db = {};

const basename = path.basename(__filename);
fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        let model = sequelize['import'](path.resolve(__dirname, file));
        db[model.className] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
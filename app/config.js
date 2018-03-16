const fs = require('fs');
const path = require('path');
const process = require('process');


const configPath = path.resolve(process.env.HOME, '.Griever');
const coverPath = path.resolve(configPath, 'cover');
const musicPath = path.resolve(configPath, 'music');

[configPath, coverPath, musicPath].forEach(_path => {
    if (!fs.existsSync(_path)) fs.mkdirSync(_path);
})

module.exports = {
    configPath,
    coverPath,
    musicPath
}
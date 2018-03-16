module.exports = (sequlize, DataTypes) => {
    const Artist = sequlize.define('artists', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        neteaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
        },

    }, {
        indexes: [{
            unique: true,
            fields: ['neteaseId']
        }]
    })

    Artist.className = 'Artist';

    Artist.associate = function (models) {
        Artist.hasMany(models.Song);
        Artist.hasMany(models.Album);
    }

    return Artist;
}
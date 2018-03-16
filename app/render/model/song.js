module.exports = (sequlize, DataTypes) => {
    let Song = sequlize.define('songs', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        neteaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        track: {
            type: DataTypes.STRING,
        },
        title: {
            type: DataTypes.STRING,
        },
        lrc: {
            type: DataTypes.TEXT,
        },
        artistId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'artists',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade',
        },
        albumId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'albums',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade',

        },
    }, {
        indexes: [{
            unique: true,
            fields: ['neteaseId']
        }]

    });

    Song.className = 'Song';

    Song.associate = function (models) {
        Song.belongsTo(models.Album);
        Song.belongsTo(models.Artist);
    }

    return Song;
}
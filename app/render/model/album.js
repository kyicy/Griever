module.exports = (sequlize, DataTypes) => {
    const Album = sequlize.define('albums', {

        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
        },
        neteaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        cover: {
            type: DataTypes.STRING,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },

    }, {
        indexes: [{
            unique: true,
            fields: ['neteaseId']
        }]
    });

    Album.className = 'Album';

    Album.associate = function (models) {
        Album.hasMany(models.Song);
        Album.belongsTo(models.Artist);
    };
    return Album;
}
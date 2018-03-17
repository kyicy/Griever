module.exports = (sequlize, DataTypes) => {
    const Playlist = sequlize.define('playlists', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
        },

    });

    Playlist.className = 'Playlist';

    Playlist.associate = function (models) {
        Playlist.belongsToMany(models.Song, {
            through: models.PlaylistSong
        });
    }

    return Playlist;
}
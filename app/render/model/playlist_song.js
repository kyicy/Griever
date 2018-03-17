module.exports = (sequlize, DataTypes) => {
    const PlaylistSong = sequlize.define('playlist_songs', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        playlistId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'playlists',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade',

        },
        songId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'songs',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade',
        },

    });

    PlaylistSong.className = 'PlaylistSong';


    return PlaylistSong;
}
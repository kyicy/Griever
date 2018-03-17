module.exports = {
    up: async function (query, DataTypes) {
        return await query.addIndex('playlist_songs', ['playlistId', 'songId'], {
            indicesType: 'UNIQUE',
        })
    },

    down: function (query, DataTypes) {
        return query.removeIndex('playllist_songs', ['playlistId', 'songId']);
    }
};
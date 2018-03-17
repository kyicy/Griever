module.exports = {
    up: async function (query, DataTypes) {
        await query.createTable('playlists', {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },

        });

        await query.createTable('playlist_songs', {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
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
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },

        })
    },

    down: function (query, DataTypes) {
        // return query.dropAllTables();
        return query.dropTable('artists');
    }
};
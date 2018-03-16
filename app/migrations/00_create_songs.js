module.exports = {
    up: async function (query, DataTypes) {
        await query.createTable('songs', {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            neteasyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING,
            },
            track: {
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
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        });

        return await query.addIndex('songs', ['neteasyId'], {
            indicesType: 'UNIQUE'
        })
    },

    down: function (query, DataTypes) {
        // return query.dropAllTables();
        return query.dropTable('users');
    }
};
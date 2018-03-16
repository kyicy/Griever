module.exports = {
    up: async function (query, DataTypes) {
        await query.createTable('albums', {
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

        });

        return await query.addIndex('albums', ['neteasyId'], {
            indicesType: 'UNIQUE'
        })

    },

    down: function (query, DataTypes) {
        return query.dropTable('albums');
    }
};
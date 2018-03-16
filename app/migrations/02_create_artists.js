module.exports = {
    up: async function (query, DataTypes) {
        await query.createTable('artists', {
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
        return await query.addIndex('artists', ['neteaseId'], {
            indicesType: 'UNIQUE'
        })
    },

    down: function (query, DataTypes) {
        // return query.dropAllTables();
        return query.dropTable('artists');
    }
};
module.exports = {
    up: async function (query, DataTypes) {
        await query.createTable('artists', {
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
        return await query.addIndex('artists', ['neteasyId'], {
            indicesType: 'UNIQUE'
        })
    },

    down: function (query, DataTypes) {
        // return query.dropAllTables();
        return query.dropTable('artists');
    }
};
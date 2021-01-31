module.exports = function (sequelize, DataTypes) {
    const Caretaker = sequelize.define("Caretaker", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    Caretaker.associate = function (models) {
        User.belongsTo(models.User)
    }

    return Caretaker;
};

const bcrypt = require("bcrypt")

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define("User", {
    userName: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8]
      }
    }
  });

  User.associate = function (models) {
    User.hasMany(models.Plant)
    User.hasMany(models.Caretaker)
  }

  User.beforeCreate(function (user) {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null)
  })

  return User;
};

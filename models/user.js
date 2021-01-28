module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define("User", {
    userName: DataTypes.STRING,
    name: DataTypes.STRING,
    password: DataTypes.STRING
  });
  return User;
};

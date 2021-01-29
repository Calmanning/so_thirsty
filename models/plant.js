module.exports = function(sequelize, DataTypes) {
  const Plant = sequelize.define("Plant", {
    nickname: DataTypes.STRING,
    commonName: DataTypes.STRING,
    scientificName: DataTypes.STRING,
    waterFrequency: DataTypes.INTEGER,
    notes: DataTypes.TEXT,
    trefleId: DataTypes.STRING    
  });

  Plant.associate = function(models){
    Plant.belongsTo(models.User);
    Plant.hasMany(models.Photo)
  }

  return Plant;
};

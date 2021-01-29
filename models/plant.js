module.exports = function(sequelize, DataTypes) {
  const Plant = sequelize.define("Plant", {
    nickname: DataTypes.STRING,
    commonName: DataTypes.STRING,
    scientificName: DataTypes.STRING,
    waterFrequency: DataTypes.INTEGER,
    conditions: DataTypes.TEXT,
    notes: DataTypes.TEXT,
    trefleId: DataTypes.STRING    
  });
  return Plant;
};

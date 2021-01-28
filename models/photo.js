module.exports = function(sequelize, DataTypes) {
    const Photo = sequelize.define("Photo", {        
      url: DataTypes.STRING    
    });
    return Photo;
  };
  
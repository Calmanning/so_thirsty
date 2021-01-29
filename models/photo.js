module.exports = function(sequelize, DataTypes) {
    const Photo = sequelize.define("Photo", {        
      url: DataTypes.STRING    
    });

    Photo.associate = function(models){
        Photo.belongsTo(models.Plant);      
    }

    return Photo;
  };
  
const moment = require("moment")

const helpers = {
    addWatered: (data) => {
        data.Plants = data.Plants.map(plant => {
            const today = moment()
            const lastWatered = moment(plant.dataValues.lastWatered)
            const waterDue = lastWatered.add(plant.dataValues.waterFrequency, 'days');
            plant.dataValues.waterDue = moment(waterDue).format('MM/DD/YYYY');
            plant.dataValues.isWatered = waterDue.isAfter(today)
            plant.dataValues.lastWatered = moment(plant.dataValues.lastWatered).format('MM/DD/YYYY')
            return plant;
        });
        return data;
    }
};

module.exports = helpers;
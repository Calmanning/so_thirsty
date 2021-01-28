const moment = require("moment")

const helpers = {
    addWatered: (plant) => {
        const today = moment()
        const last_watered = moment(plant.last_watered)
        const water_due = last_watered.add(plant.watering_frequency, 'days');
        plant.water_due = water_due;
        plant.is_watered = water_due.isAfter(today)
        return plant;
    }
};

module.exports = helpers;
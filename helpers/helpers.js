const moment = require("moment")

const helpers = {
    addWatered: (data) => {
        data.Plants = data.Plants.map(plant => helpers.addWateredSingle(plant));
        return data;
    },
    addWateredSingle: data => {
        const today = moment()
        const lastWatered = moment(data.dataValues.lastWatered)
        const waterDue = lastWatered.add(data.dataValues.waterFrequency, 'days');
        data.dataValues.waterDue = moment(waterDue).format('MM/DD/YYYY');
        data.dataValues.isWatered = waterDue.isAfter(today)
        data.dataValues.lastWatered = moment(data.dataValues.lastWatered).format('MM/DD/YYYY')
        
        // console.log('data in helper: ', data);
        return data;
    }
};

module.exports = helpers;
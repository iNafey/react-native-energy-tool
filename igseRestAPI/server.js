const express = require('express');
const app = express();

const admin = require("firebase-admin");
const credentials = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

const db = admin.firestore();

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.get('/igse/propertycount', async (req, res) => {
    try {
        const usersRef = db.collection("users");
        const response = await usersRef.get();
        let responseArr = [];
        response.forEach(doc => {
            responseArr.push(doc.data());
        });
        
        var detachedCount = 0;
        var semiDetachedCount = 0;
        var terracedCount = 0;
        var flatCount = 0;
        var cottageCount = 0;
        var bungalowCount = 0;
        var mansionCount = 0;

        responseArr.forEach(item => {
            currentProperty = item.propertyType;

            switch (currentProperty) {
                case "Detached":
                    detachedCount++;
                    break;
                case "Flat":
                    flatCount++;
                    break;
                case "Semi-detached":
                    semiDetachedCount++;
                    break;
                case "Terraced":
                    terracedCount++;
                    break;
                case "Cottage":
                    cottageCount++;
                    break;
                case "Bungalow":
                    bungalowCount++;
                    break;
                case "Mansion":
                    mansionCount++;
                    break;
            }
        });

        var properties = [];

        if (detachedCount > 0) {
            var detached = {
                "detached": detachedCount.toString()
            }
            properties.push(detached);
        }

        if (semiDetachedCount > 0) {
            var semiDetached = {
                "semi-detached": semiDetachedCount.toString()
            }
            properties.push(semiDetached);
        }

        if (terracedCount > 0) {
            var terraced = {
                "terraced": terracedCount.toString()
            }
            properties.push(terraced);
        }

        if (flatCount > 0) {
            var flat = {
                "flat": flatCount.toString()
            }
            properties.push(flat);
        }

        if (cottageCount > 0) {
            var cottage = {
                "cottage": cottageCount.toString()
            }
            properties.push(cottage);
        }

        if (bungalowCount > 0) {
            var bungalow = {
                "bungalow": bungalowCount.toString()
            }
            properties.push(bungalow);
        }

        if (mansionCount > 0) {
            var mansion = {
                "mansion": mansionCount.toString()
            }
            properties.push(mansion);
        }

        res.send(properties);
    } catch (error) {
        res.send(error);
    }
})

app.get('/igse/:property_type/:bedrooms', async(req, res) => {
    try {

        var propertyType = req.params.property_type;
        var bedrooms = req.params.bedrooms.toString();

        const usersRef = db.collection("users");
        const response = await usersRef.get();
        let responseArr = [];
        response.forEach(doc => {
            responseArr.push(doc.data());
        });

        energyUsageList = []
        
        responseArr.forEach(user => {
            if (user.propertyType == propertyType && user.noOfBedrooms == bedrooms) {
                totalReadings = user.listOfReadings.length;
                energyConsumption = 0

                //Only get readings that exist
                if (totalReadings > 0){
                    for (let i=0; i<totalReadings; i++) {
                        energyConsumption +=  parseInt(user.listOfReadings[i].dayReading) + parseInt(user.listOfReadings[i].nightReading) + parseInt(user.listOfReadings[i].gasReading)
                    }
                }
                energyUsageList.push(energyConsumption);
            }
        })

        const average = array => array.reduce((a, b) => a + b) / array.length;

        averageEnergyUsage = Math.round(average(energyUsageList)*100)/100;

        outputJson = {
            "type": propertyType,
            "id": bedrooms,
            "average_electricity_gas_cost_per_day": averageEnergyUsage.toString() ,
            "unit": "pound"
        }

        res.send(outputJson);

    } catch (error) {
        res.send(error);
    }
})

const PORT = 8080;
app.listen (PORT, () => {
    console.log(`Server is running on port 8080`);
})
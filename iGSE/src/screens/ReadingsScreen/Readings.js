import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Button, Text } from '@ui-kitten/components';
import { firebase } from '../../../firebase/firebase_config';

//Reading object to display in each list item
function Reading(key, email, date, day, night, gas) {
  this.key = key;
  this.email = email;
  this.date = date;
  this.day = day;
  this.night = night;
  this.gas = gas;
}

const Readings = () => {

  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(false);

  //Timeout function to allow more consistent and stable state updates
  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time)
    )
  }

  //Get all valid readings from firebase and display on screen.
  const getReadings = async () => {
    setLoading(true);
    setReadings([]);

    var allReadings = []
    var keyIncrement = 1;

    await firebase.firestore().collection("users")
      .onSnapshot(
        querySnapshot => {
          const users = [];
          querySnapshot.forEach((doc) => {
            const { email } = doc.data();
            let currentEmail = email;

            const { listOfReadings } = doc.data();
            //console.log("No of readings: "+ listOfReadings.length);

            if (listOfReadings.length > 0) {
              for (let i = 0; i < listOfReadings.length; i++) {
                let currentReading = new Reading(keyIncrement, currentEmail, listOfReadings[i].date, listOfReadings[i].dayReading, listOfReadings[i].nightReading, listOfReadings[i].gasReading);
                allReadings.push(currentReading);

                keyIncrement += 1;
              }
            }
          });
        }
      )
    keyIncrement = 1;
    //console.log(allReadings);
    await sleep(3000).then(() => {
      //console.log(allReadings);
      setLoading(false);
      setReadings(allReadings);
    })


  }

  return (
    <ScrollView>
      <SafeAreaView style={styles.content}>
        <Text category="h4" status='primary'>Readings</Text>
        <Text style={styles.paraText}>All users' uploaded meter readings</Text>
        <View style={styles.btnContainer}>
          <Button style={styles.generateBtn} onPress={getReadings}>GENERATE</Button>
        </View>

        {loading ? <ActivityIndicator /> : null}

        {readings.map(item => (
          <View style={styles.listItem} key={item.key}>
            <Text>Email: {item.email} {"\n"}Date: {item.date} {"\n"}Electricity Day: {item.day}kWh {"\n"}Electricity Night: {item.night}kWh {"\n"}Gas: {item.gas}kWh</Text>
          </View>
        ))}


      </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    margin: 15,
  },
  paraText: {
    fontStyle: "italic"
  },
  listItem: {
    backgroundColor: "#fff",
    color: '#454f51',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  btnContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  generateBtn: {
    margin: 10,

  }

})

export default Readings;
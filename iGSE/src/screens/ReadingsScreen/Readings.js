import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Button, Text } from '@ui-kitten/components';
import { firebase } from '../../../firebase/firebase_config';

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

  function sleep(time){
    return new Promise((resolve)=>setTimeout(resolve,time)
  )
  }

  const getReadings =  async () => {
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

          if (listOfReadings.length > 0){
            for (let i=0; i<listOfReadings.length; i++) {
              let currentReading = new Reading(keyIncrement, currentEmail, listOfReadings[i].date, listOfReadings[i].dayReading, listOfReadings[i].nightReading, listOfReadings[i].gasReading);
              allReadings.push(currentReading);

              keyIncrement += 1;
            }
          }
        });
      }
    )
    keyIncrement=1;
    //console.log(allReadings);
    await sleep(3000).then(()=>{
      //console.log(allReadings);
      setLoading(false);
      setReadings(allReadings);
   })


  }

  return (
    <ScrollView>
      <SafeAreaView style={styles.content}>
        <Text style={styles.paraText} category="h4">All users meter readings</Text>
        <View style={styles.btnContainer}>
          <Button style={styles.generateBtn} onPress={getReadings}>GENERATE</Button>
        </View>

        { loading ? <ActivityIndicator /> : null }
        
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
      //fontSize: 16,
      color: 'black'
    },
    listItem: {
      backgroundColor: "#fff",
      color: '#454f51',
      marginVertical: 5,
      padding: 10,
      borderRadius: 10,
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
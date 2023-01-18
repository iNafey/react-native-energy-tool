import { View, SafeAreaView, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Text } from '@ui-kitten/components';
import { firebase } from '../../../firebase/firebase_config';

const Bill = () => {
  const [latestBill, setLatestBill] = useState(0.0);
  const [energyCredit, setEnergyCredit] = useState(0);
  const [readingsNo, setReadingsNo] = useState();
  var currentUserData;

  //Generate bill and credit once screen is opened
  useEffect(() => {
    generateBillAndCredit();
  })

  /* Get meter readings between latest unpaid periods and generate a bill 
     with up to date energy tariff prices. Also fetch and display energy credit. */
  const generateBillAndCredit = async () => {

    await firebase.firestore().collection('users')
      .doc(firebase.auth().currentUser.uid).get()
      .then((snapshot) => {
        if (snapshot.exists) {
          currentUserData = snapshot.data();
        } else {
          console.log("User does not exist!");
        }
      });

    noOfReadings = currentUserData.listOfReadings.length;

    //Round credit value to 2 decimal places
    roundedCredit = Math.round(currentUserData.credit * 100) / 100
    setEnergyCredit(roundedCredit);

    //Only calculate a bill if there are 2 readings.
    //Can only check usage by calculate difference in energy usage between 2 dates.
    if (noOfReadings > 1) {
      for (i = 1; i < noOfReadings; i++) {
        let currentReadings = currentUserData.listOfReadings[i];
        let isBillPaid = currentReadings.billPaid;
        //console.log("Current index: "+i);

        //Find the periods between meter readings that havent been paid already.
        //Get usage between latest submission date (Date B) and previous submission date (Date A).
        if (isBillPaid == false) {
          setReadingsNo(i);

          let previousReadings = currentUserData.listOfReadings[i - 1];

          let currentDateString = currentReadings.date;
          let currentArr = currentDateString.split("/");
          const endDate = new Date(parseInt(currentArr[2]), parseInt(currentArr[0]) - 1, parseInt(currentArr[1]));

          let previousDateString = previousReadings.date;
          let previousArr = previousDateString.split("/");
          const startDate = new Date(parseInt(previousArr[2]), parseInt(previousArr[0]) - 1, parseInt(previousArr[1]));


          const diffDays = Math.floor(((endDate - startDate) / (1000 * 60 * 60 * 24)));
          //console.log(diffDays + " days");
          if (diffDays <= 0) Alert.alert("End date is before start date!");


          let electricityDayUsage = parseInt(currentReadings.dayReading) - parseInt(previousReadings.dayReading);
          let electricityNightUsage = parseInt(currentReadings.nightReading) - parseInt(previousReadings.nightReading);
          let gasUsage = parseInt(currentReadings.gasReading) - parseInt(previousReadings.gasReading);

          //console.log("Duration: "+diffDays+", Day: "+ electricityDayUsage+ ", Night: "+electricityNightUsage+", Gas:"+gasUsage)

          //Once usage during a time period has been calculated, get the energy rates set by admin.
          var rates;
          await firebase.firestore().collection('rates')
            .doc('currentRates')
            .get()
            .then((snapshot) => {
              if (snapshot.exists) {
                rates = snapshot.data();
              } else {
                console.log("Rates does not exist!");
              }
            }).catch(error => {
              Alert.alert("Couldn't get latest rates", error.message);
            });

          //Calculate bill as a float number
          let rawBill = (parseInt(electricityDayUsage) * rates.dayReading) + (parseInt(electricityNightUsage) * rates.nightReading) + (parseInt(gasUsage) * rates.gasReading) + (parseInt(diffDays) * rates.standingCharge);

          //Round to 2 decimals
          let bill = Math.round(rawBill * 100) / 100;
          
          //Output to user
          setLatestBill(bill);

          //console.log(bill);
          break;
        }
      }
    }


  }

  generateBillAndCredit();
  
  //Pay bill only if there is enough credit
  const payBill = async () => {

    if (energyCredit >= latestBill) {
      resultantCredit = energyCredit - latestBill;
      var billPaid = true;
      currentUserData.credit = resultantCredit;
      currentUserData.listOfReadings[readingsNo].billPaid = true;
      //console.log(currentUserData);

      let address = currentUserData.address;
      let credit = currentUserData.credit;
      let email = currentUserData.email;
      let evc = currentUserData.evc;
      let listOfBills = currentUserData.listOfBills;
      let listOfEvcs = currentUserData.listOfEvcs;
      let listOfReadings = currentUserData.listOfReadings;
      let noOfBedrooms = currentUserData.noOfBedrooms;
      let propertyType = currentUserData.propertyType;
      let pwd = currentUserData.pwd;
      let userName = currentUserData.userName;

      //Upload the latest changes to firebase
      await firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid)
        .set({
          address,
          credit,
          email,
          evc,
          listOfBills,
          listOfEvcs,
          listOfReadings,
          noOfBedrooms,
          propertyType,
          pwd,
          userName
        })
        .catch(error => {
          alert(error.message);
        })
      
      //Output the resultant credit value to user and reset bill price.
      setEnergyCredit(resultantCredit);
      setLatestBill(0);

    } else {
      //When there isn't enough credit don't do any transaction and notify user.
      Alert.alert("Transaction unsuccessful", "Not enough credit.")
    }
  }

  return (
    <SafeAreaView style={styles.content}>
      <View>
        <Text style={{ color: '#2e71ff' }} category="h3">Bills</Text>
        <Text style={styles.paraText}>View and pay your latest unpaid bill {"\n\n"}Readings on min. 2 dates needed to generate a bill</Text>
        <Text style={styles.labelText} category="h6">Latest bill <Text style={{ color: "red" }}>(unpaid)</Text>: £{latestBill}</Text>
        <Text style={styles.labelText} category="h6">Your energy credit:  £{energyCredit}</Text>
        {latestBill > 0 ?
          <View style={styles.btnContainer}>
            <Button appearance="outline" status="info" onPress={generateBillAndCredit}>REFRESH</Button>
            <Button style={styles.payBtn} onPress={payBill}>PAY</Button>
          </View>
          :
          <View style={styles.btnContainer}>
            <Button appearance="outline" status="info" onPress={generateBillAndCredit}>REFRESH</Button>
            <Button style={styles.payBtn} disabled={true}>PAY</Button>
          </View>
        }

        <View style={styles.btnContainer}>

        </View>


      </View>
    </SafeAreaView>
  )

}

const styles = StyleSheet.create({
  content: {
    margin: 20
  },
  paraText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#485450'
  },
  labelText: {
    color: '#4e4551',
    //alignSelf: 'stretch', 
    marginTop: 15
  },
  payBtn: {
    marginTop: 75,
    marginLeft: 10

  },
  btnContainer: {
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: "center",
  }
})

export default Bill
import { SafeAreaView, View, StyleSheet, ActivityIndicator} from 'react-native';
import React, { useState } from 'react';
import { Datepicker, Button, Icon, Text } from '@ui-kitten/components';
import { useForm, Controller, set } from 'react-hook-form';
import CustomButton from '../../components/CustomButton';
import { firebase } from '../../../firebase/firebase_config';

const CalendarIcon = (props) => (
  <Icon {...props} name='calendar'/>
  //<Ionicons name='wallet'></Ionicons>
);

const AdminScreen = () => {
  const [submitDate, setSubmitDate] = useState('');
  const [showAvgEnergy, setShowAvgEnergy] = useState(false);
  const [avgElectricityUsage, setAvgElectricityUsage] = useState("0");
  const [avgGasUsage, setAvgGasUsage] = useState("0");
  const [loading, setLoading] = useState(false);

  const {control, handleSubmit, formState: {errors}, watch} = useForm({mode: 'onBlur'});

  function sleep(time){
    return new Promise((resolve)=>setTimeout(resolve,time)
  )
  }

  const getUsage = async (data) => {
    setLoading(true);
    //console.log(data.date + "Works!");
    //setShowAvgEnergy(true);
    let electricityList = [];
    let gasList = [];

    await firebase.firestore().collection('users')
    .onSnapshot(
      querySnapshot => {
        const users = [];
        querySnapshot.forEach((doc) => {

          const { listOfReadings } = doc.data();
          //console.log("No of readings: "+ listOfReadings.length);

          if (listOfReadings.length > 0){
            for (let i=0; i<listOfReadings.length; i++) {
              if (data.date == listOfReadings[i].date) {
                //console.log(listOfReadings[i]);
                let combinedElecReading = parseInt(listOfReadings[i].dayReading)+ parseInt(listOfReadings[i].nightReading);
                electricityList.push(combinedElecReading);
                gasList.push(parseInt(listOfReadings[i].gasReading));
              }
            }
          }
        });
      }
    )
    
    await sleep(3000).then(()=>{
      
      const average = array => array.reduce((a, b) => a + b) / array.length;

      if (electricityList.length > 0 && gasList.length > 0){
        let avgE = Math.round(average(electricityList)*100)/100;
        setAvgElectricityUsage(avgE);

        let avgG = Math.round(average(gasList)*100)/100;
        setAvgGasUsage(avgG);
      }
      
      setLoading(false);
      setShowAvgEnergy(true);

      //console.log("Electricity avg: " + average(electricityList));
      //console.log("Gas avg: " + average(gasList));

   })

  }
  return (
    <SafeAreaView style={styles.content}>
      <Text style={styles.paraText} status="info" category="h3" >Hello Admin!</Text>

      <Text style={styles.labelText} status="primary" category="h5">Average Energy Usage (by date)</Text>
      <Controller
        name="date"
        control={control}
        rules={{
          required:'Submission date of readings is required.'
        }}
        render={({ field: { onChange, value }, fieldState:{error} }) => {
          return(
            <>
              <View style={{borderColor: error ? 'red' : '#e8e8e8'}}>
                <Datepicker
                  //label='Submission date (Required)'
                  placeholder='Pick date'
                  date={submitDate}
                  value={value}
                  onSelect={nextDate => onChange(nextDate.toLocaleDateString()) && setSubmitDate(nextDate)}
                  accessoryRight={CalendarIcon}
                  name="submitDate"
                />
              </View>
              {error && (
              <Text style={{color: 'red', alignSelf: 'stretch'}}>{error.message || Error}</Text>
              )}
            </>
          )
        }
      } 
      />

      <CustomButton
          type='PRIMARY'
          text="GET USAGE" 
          onPress={handleSubmit(getUsage)} 
      />

      { loading ? <ActivityIndicator /> : null }

      {showAvgEnergy ? 
      <Text style={{marginTop: 30}} category='h6'>Average Electricity Consumption: {avgElectricityUsage}kWh {"\n\n"}Average Gas Consumption: {avgGasUsage}kWh</Text> 
      : null}

      <View style={[styles.btnContainer, {justifyContent: "center", alignItems: "center", marginTop: 60}]}>
          <Button 
            style={styles.button} 
            status='danger'
            onPress={() => {firebase.auth().signOut()}}
            >
            LOGOUT
          </Button>
        </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    content: {
      margin: 15,
    },
    paraText: {
      //fontSize: 16,
    },
    labelText: {
      marginVertical: 10,
    },
    button: {
      marginTop: 100,
      justifyContent: "center",
      alignItems: "center"
      //width: 120,
    },
    btnContainer: {
      flexDirection: "row",
      flexWrap: 'wrap',
    },
})

export default AdminScreen
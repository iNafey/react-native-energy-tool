import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Datepicker, Icon, Text } from '@ui-kitten/components';
import React, { useState } from 'react';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { firebase } from '../../../firebase/firebase_config';
import { useForm, Controller } from 'react-hook-form';

const CalendarIcon = (props) => (
  <Icon {...props} name='calendar' />
);

const UploadReading = () => {
  const [submitDate, setSubmitDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [dayReadingError, setDayReadingError] = useState(false);
  const [nightReadingError, setNightReadingError] = useState(false);
  const [gasReadingError, setGasReadingError] = useState(false);

  var previousDateString;
  var previousDayReading
  var previousNightReading
  var previousGasReading

  const { control, handleSubmit, formState: { errors }, watch } = useForm({ mode: 'onBlur' });

  //Get all user's inputs and update the list of readings for current user in firebase. (With server side validation)
  const processInput = async (data) => {
    setSubmitting(true);
    setDateError(false);
    setDayReadingError(false);
    setNightReadingError(false);
    setGasReadingError(false);

    var currentUserData;
    var invalidDate = false;
    var invalidDayReading = false;
    var invalidNightReading = false;
    var invalidGasReading = false;

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
    let currentSubmissionDate = data.date;
    var arr = currentSubmissionDate.split("/");
    const latestDate = new Date(parseInt(arr[2]), parseInt(arr[0]) - 1, parseInt(arr[1]));
    var latestDayReading = data.dayReading;
    var latestNightReading = data.nightReading;
    var latestGasReading = data.gasReading;

    //Only if there is 1 or more readings then do server side validation
    if (noOfReadings > 0) {
      let previousSubmissionDate = currentUserData.listOfReadings[noOfReadings - 1].date;
      var prevArr = previousSubmissionDate.split("/");
      const previousDate = new Date(parseInt(prevArr[2]), parseInt(prevArr[0]) - 1, parseInt(prevArr[1]));
      previousDateString = previousDate.toDateString();
      //console.log("Current submission date: "+latestDate+", Previous submission date: "+previousDate);

      previousDayReading = currentUserData.listOfReadings[noOfReadings - 1].dayReading;
      previousNightReading = currentUserData.listOfReadings[noOfReadings - 1].nightReading;
      previousGasReading = currentUserData.listOfReadings[noOfReadings - 1].gasReading;

      //Check if new reading submission date is before the previous submission date
      try {
        const diffDays = Math.floor(((latestDate - previousDate) / (1000 * 60 * 60 * 24)));
        //console.log(diffDays + " days");
        if (diffDays <= 0) invalidDate = true;

      } catch (error) {
        console.log(error);
      }

      //Check if any of the readings are smaller than previous readings' values
      if ((latestDayReading - previousDayReading) < 0) invalidDayReading = true;

      if ((latestNightReading - previousNightReading) < 0) invalidNightReading = true;

      if ((latestGasReading - previousGasReading) < 0) invalidGasReading = true;

    } else {
      console.log("First submission date: " + currentSubmissionDate);
    }

    //If all validation is passed, add it to firebase db, else return responsive error message(s).
    if (invalidDate == false && invalidDayReading == false && invalidNightReading == false && invalidGasReading == false) {
      var aReading = {
        date: data.date,
        dayReading: data.dayReading,
        nightReading: data.nightReading,
        gasReading: data.gasReading,
        billPaid: false
      }

      await firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid)
        .update({
          listOfReadings: firebase.firestore.FieldValue.arrayUnion(aReading)
        })
        .catch(error => {
          alert(error.message);
        })

      setSubmitting(false);
      Alert.alert('Your readings submission info', 'Meter readings have been added.');

    } else {
      if (invalidDate == true) {
        Alert.alert('Invalid submission date error', "Submission date cannot be same or earlier than previous submission on " + previousDateString);
        setSubmitting(false);
        setDateError(true);
      }

      if (invalidDayReading == true) {
        Alert.alert('Invalid day reading error', "Electricity day reading cannot be less than previously submitted value of " + previousDayReading);
        setSubmitting(false);
        setDayReadingError(true);
      }

      if (invalidNightReading == true) {
        Alert.alert('Invalid night reading error', "Electricity night reading cannot be less than previously submitted value of " + previousNightReading);
        setSubmitting(false);
        setNightReadingError(true);
      }

      if (invalidGasReading == true) {
        Alert.alert('Invalid gas reading error', "Gas reading cannot be less than previously submitted value of " + previousGasReading);
        setSubmitting(false);
        setGasReadingError(true);
      }
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.screenText}>
        <Text style={styles.headerText}>Meter readings</Text>
        <Text style={styles.paraText}>
          Submit new electricity and gas readings to generate a bill
        </Text>

        <Text
          style={styles.labelText}
          category='h6' >Submission date</Text>

        <Controller
          name="date"
          control={control}
          rules={{
            required: 'Submission date of readings is required.'
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <>
                <View style={{ borderColor: error ? 'red' : '#e8e8e8' }}>
                  <Datepicker
                    //label='Submission date (Required)'
                    placeholder='Pick date'
                    date={submitDate}
                    value={value}
                    onSelect={nextDate => onChange(nextDate.toLocaleDateString('en-US')) && setSubmitDate(nextDate)}
                    accessoryRight={CalendarIcon}
                    name="submitDate"
                  />
                </View>
                {error && (
                  <Text style={{ color: 'red', alignSelf: 'stretch' }}>{error.message || Error}</Text>
                )}
              </>
            )
          }
          }
        />

        {/* Server side validation error */}
        {dateError ? (<Text style={{ color: 'red' }}>Submission date cannot be earlier than the previous submission date.</Text>) : null}


        <Text
          style={styles.labelText}
          category='h6' >Electricity meter reading - Day (in kWh)
        </Text>

        <CustomInput
          name="dayReading"
          rules={{
            required: 'Reading during day time is required.',
            maxLength: {
              value: 6,
              message: 'Enter a whole number between 0 and 999999.'
            },
            validate: value => parseInt(value) >= 0 || "Enter a whole number (0,1,2,...)",
          }}
          placeholder="(e.g. 100)"
          control={control}
        />

        {/* Server-side validaton error */}
        {dayReadingError ? (<Text style={{ color: 'red' }}>Electricity day reading cannot be less than previously submitted.</Text>) : null}

        <Text
          style={styles.labelText}
          category='h6' >Electricity meter reading - Night (in kWh)
        </Text>

        <CustomInput
          name="nightReading"
          rules={{
            required: 'Reading during night time is required.',
            maxLength: {
              value: 6,
              message: 'Enter a whole number between 0 and 999999.'
            },
            validate: value => parseInt(value) >= 0 || "Enter a whole number (0,1,2,...)",
          }}
          placeholder="(e.g. 250)"
          control={control}
        />

        {/* Server-side validation error */}
        {nightReadingError ? (<Text style={{ color: 'red' }}>Electricity night reading cannot be less than previously submitted.</Text>) : null}

        <Text
          style={styles.labelText}
          category='h6' >Gas meter reading (in kWh)
        </Text>

        <CustomInput
          name="gasReading"
          rules={{
            required: 'Gas reading is required.',
            maxLength: {
              value: 6,
              message: 'Enter a whole number between 0 and 999999.'
            },
            validate: value => parseInt(value) >= 0 || "Enter a whole number (0,1,2,...)",
          }}
          placeholder="(e.g. 800)"
          control={control}
        />

        {/* Server-side validation error */}
        {gasReadingError ? (<Text style={{ color: 'red' }}>Gas reading cannot be less than previously submitted.</Text>) : null}
        <CustomButton
          type='PRIMARY'
          text="Submit"
          onPress={handleSubmit(processInput)}

        />

        {/* Submission loading spin wheel */}
        {submitting ? (<ActivityIndicator size="large" />) : null}

      </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screenText: {
    margin: 20,
  },

  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e71ff'
  },

  paraText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#485450'
  },

  labelText: {
    color: '#4e4551',
    //alignSelf: 'stretch', 
    marginTop: 15

  }
})
export default UploadReading
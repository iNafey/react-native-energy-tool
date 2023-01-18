import { View, StyleSheet, Alert, SafeAreaView } from 'react-native'
import React from 'react'
import { Text } from '@ui-kitten/components';
import { useForm } from 'react-hook-form';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { firebase } from '../../../firebase/firebase_config';

const Rates = () => {

  const { control, handleSubmit, formState: { errors }, watch } = useForm({ mode: 'onBlur' });

  const updateRates = async (rates) => {

    //Update rates collection in firebase
    await firebase.firestore().collection('rates')
      .doc('currentRates')
      .update({
        dayReading: rates.electricityDayRate,
        nightReading: rates.electricityNightRate,
        gasReading: rates.gasRate,
      })
      .catch(error => {
        Alert.alert(error.message);
      })

    Alert.alert("Update information", "Rates updated successfully");
  }

  return (
    <SafeAreaView style={styles.content}>
      <Text category='h3' status='primary'>Rates</Text>
      <Text style={styles.paraText}>Set rates for customers</Text>

      <View style={styles.inputField}>
        <CustomInput
          name="electricityDayRate"
          rules={{
            required: 'Electricity day rate is required.',
            maxLength: {
              value: 5,
              message: 'Enter a decimal between 0.00 and 99.99'
            },
            validate: value => parseFloat(value) >= 0 || "Enter a decimal number",
          }}
          placeholder="Electricity Day Rate (£ per kWh)"
          control={control}
        />
      </View>

      <View style={styles.inputField}>
        <CustomInput
          name="electricityNightRate"
          rules={{
            required: 'Electricity night rate is required.',
            maxLength: {
              value: 5,
              message: 'Enter a decimal between 0.00 and 99.99'
            },
            validate: value => parseFloat(value) >= 0 || "Enter a decimal number",
          }}
          placeholder="Electricity Night Rate (£ per kWh)"
          control={control}
        />
      </View>

      <View style={styles.inputField}>
        <CustomInput
          name="gasRate"
          rules={{
            required: 'Gas rate is required.',
            maxLength: {
              value: 5,
              message: 'Enter a decimal between 0.00 and 99.99'
            },
            validate: value => parseFloat(value) >= 0 || "Enter a decimal number",
          }}
          placeholder="Gas Rate (£ per kWh)"
          control={control}
        />
      </View>

      <CustomButton
        type='PRIMARY'
        text="UPDATE"
        onPress={handleSubmit(updateRates)}
      />


    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    margin: 15,
  },
  paraText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#485450'
  },
  inputField: {
    marginVertical: 10,
  }
})

export default Rates
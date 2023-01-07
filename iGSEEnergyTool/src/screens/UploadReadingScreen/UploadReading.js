import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const UploadReading = () => {
  return (
    <View style={styles.screenText}>
      <Text style={styles.text}>You can submit new meter readings. {"\n\n"}
            You will need submission date (default is today),
            Electricity meter reading - Day,
            Electricity meter reading - Night, and
            Gas meter reading.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screenText: {
    margin: 10,
  },

  text: {
    fontSize: 18,
  }
})
export default UploadReading
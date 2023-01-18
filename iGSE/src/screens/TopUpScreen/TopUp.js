import { View, ScrollView, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import { Button, Icon, Text } from '@ui-kitten/components';
import { firebase } from '../../../firebase/firebase_config';
import { useForm } from 'react-hook-form';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import MyInput from '../../components/MyInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QR_CODE_REGEX = /^[A-Z0-9]*$/;

const RefreshIcon = (props) => (
  <Icon {...props} name='refresh' />
);

const TopUp = () => {
  const [energyCredit, setEnergyCredit] = useState(0);
  const [codeUsed, setCodeUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  var currentUserData;

  const { control, register, setValue, handleSubmit, formState: { errors }, watch } = useForm({ mode: 'onBlur' });

  const navigation = useNavigation();
  const route = useRoute();

  //Call this function whenever the paramKey value has changed and set evc input field's value.
  useEffect(() => {
    if (route.params?.paramKey) {
      console.log("Sent successfully");
      setValue("evc", route.params.paramKey)
    }

    calculateCredit();
  }, [route.params?.paramKey]);

  //Call this function when user want's to access camera to scan QR code
  const onScanVoucherPressed = async () => {
    try {
      await AsyncStorage.setItem('navigatedFrom', "Credit");
      navigation.navigate('ScanVoucher');

    } catch (e) {
      alert(e);
    }
  }

  /* Custom sleep function to provide stable and consistent state changes 
     given the asynchronous status of js */
  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time)
    )
  }

  //Access firebase to get user's credit and output it on the screen
  const calculateCredit = async () => {
    await firebase.firestore().collection('users')
      .doc(firebase.auth().currentUser.uid).get()
      .then((snapshot) => {
        if (snapshot.exists) {
          currentUserData = snapshot.data();
        } else {
          console.log("User does not exist!");
        }
      });

    let credit = Math.round(currentUserData.credit * 100) / 100
    setEnergyCredit(credit);
  }

  //Check if evc was used, update firebase with newly added credit and show changes to user
  const addCredit = async (inputEvc) => {
    setLoading(true);
    setCodeUsed(false);

    let codeWasUsed = false;
    console.log(inputEvc.evc);
    let currentEvc = inputEvc.evc

    //Check if EVC is already used
    await firebase.firestore().collection('users')
      .onSnapshot(
        querySnapshot => {
          const users = [];
          querySnapshot.forEach((doc) => {
            const { listOfEvcs } = doc.data();
            if (listOfEvcs.includes(currentEvc)) {
              codeWasUsed = true;
            }
          });
        }
      )

    await sleep(2000).then(() => {
      if (codeWasUsed != true) {
        updateCredit(codeWasUsed, inputEvc.evc);
        Alert.alert("Transaction information", "£200 successfully added");

      } else {
        setCodeUsed(true);

      }
      setLoading(false);

    })

  }

  //If code wasn't used then update firebase
  const updateCredit = async (codeWasUsed, evc) => {
    if (codeWasUsed != true) {
      let newBalance = energyCredit + 200;
      setEnergyCredit(newBalance);
      console.log("200 added!");

      await firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid)
        .update({
          credit: newBalance,
          listOfEvcs: firebase.firestore.FieldValue.arrayUnion(evc)
        })
        .catch(error => {
          Alert.alert(error.message);
        })
    }
  }

  return (
    <ScrollView>
      <SafeAreaView style={styles.content}>
        <Text style={{ color: '#2e71ff' }} category="h3">Credit Top Up</Text>
        <Text style={styles.paraText}>Top up energy credit with EVC (each worth £200)</Text>
        <View style={styles.creditRow}>
          <Text style={styles.labelText} category="h6">Your energy credit:  £{energyCredit}</Text>
          <View styles={styles.btnContainer}><Button style={styles.refreshBtn} accessoryRight={RefreshIcon} appearance="outline" status="success" onPress={calculateCredit} /></View>
        </View>

        <Text style={[styles.formtext, { color: '#383d3c' }]} category="h6">Energy Voucher Code (EVC)</Text>

        <Text style={{ color: "red", marginBottom: 25 }}>IMPORTANT: {'\n\n'}- If camera view is black, then restart the app.</Text>

        <CustomButton
          type='SECONDARY'
          text="Scan QR Code"
          onPress={onScanVoucherPressed}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#78757b' }} />
          <View>
            <Text style={{ width: 150, textAlign: 'center', fontWeight: 'bold', color: '#78757b', marginVertical: 25, }}>OR enter manually</Text>
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: '#78757b' }} />
        </View>

        <MyInput
          name="evc"
          rules={{
            required: 'EVC is required.',
            pattern: {
              value: QR_CODE_REGEX,
              message: 'Invalid code - must only be uppercase letters and numbers.'
            },
            maxLength: {
              value: 8,
              message: 'Code must be 8-digits only.'
            },
            minLength: {
              value: 8,
              message: 'Code must be 8-digits only.'
            },
          }}
          placeholder="Enter 8-digit EVC code"
          control={control}
        />
        <CustomButton
          type='PRIMARY'
          text="Top Up"
          onPress={handleSubmit(addCredit)}
        />
        {loading ? <ActivityIndicator /> : null}
        {codeUsed ? (<Text style={{ color: 'red' }}>EVC already used. Try a different code.</Text>) : null}
      </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    margin: 20,
  },
  paraText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#485450'
  },
  labelText: {
    color: '#4e4551',
    //alignSelf: 'stretch', 
    marginTop: 15
  },
  creditRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  btnContainer: {
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: "center",
  },
  refreshBtn: {
    margin: 5,
  },
  formtext: {
    //flexDirection: 'column',
    //justifyContent: 'center',
    //flex: 1,
    fontWeight: 'bold',
    color: '#78757b',
    marginVertical: 25,
  },
});

export default TopUp
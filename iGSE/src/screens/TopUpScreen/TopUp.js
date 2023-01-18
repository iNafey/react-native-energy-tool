import { View, ScrollView, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import {useNavigation, useRoute} from '@react-navigation/core';
import { Button, Icon, Text } from '@ui-kitten/components';
import { firebase } from '../../../firebase/firebase_config';
import { useForm, Controller } from 'react-hook-form';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const QR_CODE_REGEX = /^[A-Z0-9]*$/;

const RefreshIcon = (props) => (
  <Icon {...props} name='refresh'/>
  //<Ionicons name='wallet'></Ionicons>
);

const TopUp = () => {
  const [energyCredit, setEnergyCredit] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [codeUsed, setCodeUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  var currentUserData;

  const {control, handleSubmit, formState: {errors}, watch} = useForm({mode: 'onBlur'});

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.paramKey) {
      console.log("Sent successfully");
      setVoucherCode(route.params.paramKey);
      //console.log("evc is "+voucherCode);
    }
 
    calculateCredit();
  }, [route.params?.paramKey]);

  const onScanVoucherPressed = () => {
    navigation.navigate('ScanVoucher', {
      prevScreen: 'Credit',
    });
  }

  const calculateCredit = async () => {

    await firebase.firestore().collection('users')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        currentUserData = snapshot.data();
      }else {
        console.log("User does not exist!");
      }
    });

    let credit = Math.round(currentUserData.credit * 100)/100
    setEnergyCredit(credit);
  }

  const addCredit = async (inputEvc) => {
    setLoading(true)
    setCodeUsed(false);
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
                setCodeUsed(true);        
              }
            });
          }
        )
    
    if (codeUsed != true) {
      let newBalance = energyCredit+200;
      setEnergyCredit(newBalance);
      
      await firebase.firestore().collection('users')
      .doc(firebase.auth().currentUser.uid)
      .update({
        credit: newBalance,
        listOfEvcs: firebase.firestore.FieldValue.arrayUnion(inputEvc.evc)
      })
      .catch(error  => {
        Alert.alert(error.message);
      })
    }
    
    setLoading(false);
  }

  return (
    <ScrollView>
    <SafeAreaView style={styles.content}>
      <Text style={{color: '#2e71ff'}} category="h3">Credit Top Up</Text>
      <Text style={styles.paraText}>Top up energy credit with EVC (each worth £200)</Text>
      <View style={styles.creditRow}>
        <Text style={styles.labelText} category="h6">Your energy credit:  £{energyCredit}</Text>
        <View styles={styles.btnContainer}><Button style={styles.refreshBtn} accessoryRight={RefreshIcon} appearance="outline" status="success" onPress={calculateCredit} /></View>
      </View>
      
      <Text style={[styles.formtext, {color: '#383d3c'}]} category="h6">Energy Voucher Code (EVC)</Text>
      
      <Text style={{color:"red", marginBottom: 25}}>IMPORTANT: {'\n\n'}- Once EVC is autofilled (after you scan), add a letter and remove it to submit value. {'\n'}- If camera view is black, then restart the app (not just re-open).</Text>

      <CustomButton 
        type='SECONDARY'
        text="Scan QR Code" 
        onPress={onScanVoucherPressed}
      />
        
        {/*<><Text>QR code: <Text style={{ color: '#00b140', fontWeight: 'bold' }}>{route.params?.paramKey}</Text></Text><Text style={{ color: '#00b140' }}>Type this code below</Text><Text style={styles.formtext}>OR enter manually</Text></> */}
        
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1, height: 1, backgroundColor: '#78757b'}} />
        <View>
          <Text style={{width: 150, textAlign: 'center', fontWeight: 'bold',  color: '#78757b', marginVertical: 25,}}>OR enter manually</Text>
        </View>
        <View style={{flex: 1, height: 1, backgroundColor: '#78757b'}} />
      </View>
        <CustomInput 
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
            minLength:{
              value: 8,
              message: 'Code must be 8-digits only.'
            },
          }}
          placeholder="Enter 8-digit EVC code"
          defaultValue={voucherCode}
          control={control}
        />
        <CustomButton
          type='PRIMARY'
          text="Top Up" 
          onPress={handleSubmit(addCredit)} 
        />
        { loading ? <ActivityIndicator /> : null }
        { codeUsed ? (<Text style={{color: 'red'}}>EVC already used. Try a different code.</Text>) : null }
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
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import CustomInput from '../../components/CustomInput';
import MyInput from '../../components/MyInput';
import CustomButton from '../../components/CustomButton';
import { IndexPath, Select, SelectItem } from '@ui-kitten/components';
import { useNavigation, useRoute } from '@react-navigation/core';
import { useForm, Controller } from 'react-hook-form';
import { firebase } from '../../../firebase/firebase_config';
import { sha256 } from 'react-native-sha256';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Regexes for validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
const QR_CODE_REGEX = /^[A-Z0-9]*$/;


const property_types = ['Detached', 'Semi-detached', 'Terraced', 'Flat', 'Cottage', 'Bungalow', 'Mansion'];
let pwd = "";

const SignUpScreen = () => {

  const [loading, setLoading] = useState(false);
  const [invalidEvc, setInvalidEvc] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);

  const navigation = useNavigation();

  const route = useRoute();

  const { control, register, setValue, handleSubmit, formState: { errors }, watch } = useForm({ mode: 'onBlur' });
  const watch_password = watch('password');

  //Get QR code value from camera scanner if there is any
  useEffect(() => {
    //console.log(route.params?.paramKey);
    if (route.params?.paramKey) {
      console.log("Sent successfully");
      setValue("evc", route.params?.paramKey);
    }
  }, [route.params?.paramKey]);

  //Navigate to camera scanner and update async storage/shared preferences
  const onScanVoucherPressed = async () => {
    try {
      await AsyncStorage.setItem('navigatedFrom', "SignUp");
      navigation.navigate('ScanVoucher');
    } catch (e) {
      // saving error
      Alert.alert(e);
    }
  }

  //Timeout function to ensure stable and consistent state changes
  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time)
    )
  }

  //Check if evc is already used and also encrypt the password.
  const encryptPassword = async (data) => {

    setLoading(true);
    setEmailTaken(false);
    setInvalidEvc(false);

    //console.log("checkEvcExists returns "+ dupeCheck);

    var dupeFound = false;

    await firebase.firestore().collection('users')
      .onSnapshot(
        querySnapshot => {
          const users = [];
          querySnapshot.forEach((doc) => {
            const { evc } = doc.data();
            //console.log(data.evc + " " + evc);
            if (evc === data.evc) {
              //console.log("Evc exists!"); 
              dupeFound = true;

            }
          });
        }
      )

    //Wait 2 sec
    await sleep(2000).then(() => {
      //console.log(dupeFound);
      if (dupeFound) {
        console.log("returning dupe evc true")
        //return true;
        setLoading(false);
        setInvalidEvc(true);

      } else {
        console.log("returning dupe evc false")
        //return false;

        sha256(data.password).then((hash) => {
          pwd = hash;
          //console.log(pwd);    
        });

        //Allow 1 sec for changes to be reflected across the app.
        sleep(1000).then(() => {
          onSignUpPressed(data);
        })
      }
    });
  }

  //Handling semi-validated user's inputs
  const onSignUpPressed = async (data) => {
    //console.log(data);
    const email = data.email;
    const userName = data.username;
    const address = data.address;
    const propertyType = data.property_type;
    const noOfBedrooms = data.noOfBedrooms;
    const evc_raw = data.evc;
    const evc = evc_raw.toUpperCase()
    const credit = 200;
    const listOfEvcs = [evc];
    const listOfBills = []
    const listOfReadings = []

    //Validate and update Firebase DB
    await firebase.auth().createUserWithEmailAndPassword(data.email, pwd)
      .then(() => {
        firebase.firestore().collection('users')
          .doc(firebase.auth().currentUser.uid)
          .set({
            email,
            pwd,
            userName,
            address,
            propertyType,
            noOfBedrooms,
            evc,
            credit,
            listOfEvcs,
            listOfBills,
            listOfReadings
          })
          .catch(error => {
            switch (error.code) {
              case 'auth/email-already-in-use':
                setEmailTaken(true);
            }
          })
      }).catch((error) => {
        if (error.code == 'auth/email-already-in-use') { setEmailTaken(true) }
        else { alert(error.message); }

      })

    setLoading(false);
  };

  //Navigate back to login screen
  const onSignInPress = () => {
    console.log('onSignInPressed');
    navigation.navigate('Login');

  };

  //Terms of use pop up
  const onTermsOfUsePressed = () => {
    Alert.alert("User terms and conditions:",
      "Your account details, energy credit, meter readings and bills will be stored on the platform. You will have access to this data. We will not edit any information you provide us. Bills are calculated based on latest prices and will be subject to change."
    )
  };

  //Privacy policy pop up
  const onPrivacyPressed = () => {
    Alert.alert("Privacy policy:",
      "Your details will be stored securely (private information will be encrypted). Your data maybe used by us to provide a better service but it will not be shared with any 3rd party."
    )
  };

  //Loading animating when processing user inputs and accessing firebase
  function LoadingAnimation() {
    return (
      <View style={styles.indicatorWrapper}>
        <ActivityIndicator size="large" style={styles.indicator} />
        <Text style={styles.indicatorText}>Setting up your account...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {loading ? <LoadingAnimation /> : <View style={styles.root}>
        <Text style={styles.title}>Create an account</Text>

        <MyInput
          name="username"
          rules={{
            required: 'Username is required.',
            minLength: {
              value: 4,
              message: 'Username should have at least 4 characters.'
            },
            maxLength: {
              value: 20,
              message: 'Username must contain at max 20 characters.'
            },

          }}
          placeholder="Username"
          control={control}
        />

        <MyInput
          name="email"
          rules={{
            required: 'Email is required.',
            pattern: {
              value: EMAIL_REGEX,
              message: 'Invalid email.'
            },

          }}
          placeholder="Email"
          control={control}
        />

        <MyInput
          name="password"
          rules={{
            required: 'Password is required.',
            minLength: {
              value: 5,
              message: 'Password should have at least 6 characters.'
            },
            maxLength: {
              value: 24,
              message: 'Password must contain at max 24 characters.'
            }
          }}
          placeholder="Password"
          control={control}
          secureTextEntry
        />

        <MyInput
          name="confirm_password"
          rules={{
            required: 'Re-enter the password.',
            validate: value =>
              value === watch_password || 'Passwords do not match.',
          }}
          placeholder="Confirm Password"
          control={control}
          secureTextEntry
        />

        <MyInput
          name="address"
          rules={{
            required: 'Address is required.'
          }}
          placeholder="Address line 1 (and 2 if applicable)"
          control={control}
        />

        <Text style={{
          color: 'black',
          alignSelf: 'stretch',
          fontWeight: 'bold',
          marginVertical: 15
        }
        }>Type of property <Text style={{ color: 'red' }}>(Required)</Text>
        </Text>

        <Controller
          name="property_type"
          control={control}
          rules={{
            required: 'You must choose a property type.',
          }}
          render={({ field: { onChange, value } }) => {
            //console.log(value)
            return (
              <Select
                style={styles.dropdown}
                placeholder={'Choose a property type'}
                accessibilityLabel="property type"
                value={value}
                onSelect={(index) => {
                  onChange(property_types[index.row]);
                }}>
                {property_types.map((propertyType) => (
                  <SelectItem
                    key={`select-option-${propertyType}`}
                    title={propertyType}
                  />
                ))}
              </Select>
            );
          }}
        />


        <MyInput
          name="noOfBedrooms"
          rules={{
            required: 'Number of bedrooms is required.',
            maxLength: {
              value: 6,
              message: 'Enter a whole number between 0 and 999999.'
            },
            validate: value => parseInt(value) >= 0 || "Enter a whole number (0,1,2,...)",
          }}
          placeholder="Number of bedroooms (whole number only)"
          control={control}
        />
        <Text style={[styles.formtext, { alignItems: 'flex-start', color: '#383d3c' }]}>Energy Voucher Code (EVC)</Text>

        <Text style={{ color: "red", marginVertical: 5 }}>IMPORTANT: {'\n\n'}- If camera view is black, then restart the app.</Text>

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
          text="Sign Up"
          onPress={handleSubmit(encryptPassword)
          }
        />
        {emailTaken ? (<Text style={{ color: 'red' }}>Email already in use. Login to your account instead.</Text>) : null}
        {invalidEvc ? (<Text style={{ color: 'red' }}>EVC already used. Try a different code.</Text>) : null}

        <Text style={styles.text}>
          By registering, you confirm that you accept our{' '}
          <Text style={styles.link} onPress={onTermsOfUsePressed}>
            Terms of Use
          </Text>{' '}
          and{' '}
          <Text style={styles.link} onPress={onPrivacyPressed}>
            Privacy Policy
          </Text>
        </Text>

        <CustomButton
          text="Have an account? Sign in"
          onPress={onSignInPress}
          type="TERTIARY"
        />
      </View>}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#051C60',
    marginVertical: 35,
  },
  text: {
    color: 'gray',
    marginVertical: 10,
  },
  link: {
    color: '#FDB075',
  },
  dropdown: {
    marginVertical: 5,
    borderColor: '#e8e8e8',
    width: "100%",
    backgroundColor: '#FFFFFF',
  },
  formtext: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    fontWeight: 'bold',
    color: '#78757b',
    marginVertical: 25,
  },
  indicatorWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    marginTop: "50%",
  },
  indicatorText: {
    fontSize: 18,
    marginTop: 12,
  },
  loadingAnimation: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }

});

export default SignUpScreen;

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator} from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import DropDownPicker from 'react-native-dropdown-picker';
import { IndexPath, Select, SelectItem } from '@ui-kitten/components';
import {useNavigation, useRoute} from '@react-navigation/core';
import { useForm, Controller } from 'react-hook-form';
import { firebase } from '../../../firebase/firebase_config';
import Ionicons from "react-native-vector-icons/Ionicons";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
const QR_CODE_REGEX = /^[A-Z0-9]*$/;
const property_types = ['Detached', 'Semi-detached', 'Terraced', 'Flat', 'Cottage', 'Bungalow', 'Mansion'];
/*
{label: 'Pick a property type', value: ''},
  {label: 'Detached', value: 'detached'},
  {label: 'Semi-detached', value: 'semi-detached'},
  {label: 'Terraced', value: 'terraced'},
  {label: 'Flat', value: 'flat'},
  {label: 'Cottage', value: 'cottage'},
  {label: 'Bungalow', value: 'bungalow'},
  {label: 'Mansion', value: 'mansion'}
];
*/

const SignUpScreen = () => {

  const [loading, setLoading] = useState(false);

  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(2));
  //const [showCodeMessage] = React.useState(false);
  this.state = {showCodeMessage:false};
  
  const navigation = useNavigation();

  const route = useRoute();

  //const {qrcode_string} = route.params.paramKey || null;

  const {control, handleSubmit, formState: {errors}, watch} = useForm({mode: 'onBlur'});
  const watch_password = watch('password');

  useEffect(() => {
    console.log("This was run atleast once!");
    //console.log(route.params?.paramKey);
    if (route.params?.paramKey) {
      console.log("Sent successfully");
      //CustomInput.evc.defaultValue = route.params?.paramKey;
      //displayCodeMessage();
    }
  }, [route.params?.paramKey]);

  const displayCodeMessage = () => {
    this.setState({showCodeMessage: !this.state.showCodeMessage});
  }


  const onScanVoucherPressed = () => {
    navigation.navigate('ScanVoucher');
  }


  onSignUpPressed = async (data) => {
    console.log(data);
    const email = data.email;
    const userName = data.username;
    const address = data.address;
    const propertyType = data.property_type;
    const noOfBedrooms = data.noOfBedrooms;
    const evc_raw = data.evc;
    const evc = evc_raw.toUpperCase()

    setLoading(true);

    //Validate and update Firebase DB
      await firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
      .catch((error) => {
        alert(error.message);
      }).then(() => {
        firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid)
        .set({
          email,
          userName,
          address,
          propertyType,
          noOfBedrooms,
          evc,
        })
      }).catch((error) => {
        alert(error.message);
      })
    //navigation.navigate('Login');
    setLoading(false);
  };


  const onSignInPress = () => {
    console.log('onSignInPressed');
    navigation.navigate('Login');

  };

  const onTermsOfUsePressed = () => {
    Alert.alert("User terms and conditions:", 
                "Your account details and energy vouchers/bills will be stored on the platform. Only you will have access to this data."
                )
  };

  const onPrivacyPressed = () => {
    Alert.alert("Privacy policy:",
                "Your details will be stored securely (critical information will be encrypted). Your data maybe used by us to provide a better service but it will not be shared with any 3rd party."
    )
  };

  function LoadingAnimation() {
    return (
      <View style={styles.indicatorWrapper}>
        <ActivityIndicator size="large" style={styles.indicator}/>
        <Text style={styles.indicatorText}>Setting up your account...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      { loading ? <LoadingAnimation /> : <View style={styles.root}>
        <Text style={styles.title}>Create an account</Text>

        <CustomInput
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
            }
          }}
          placeholder="Username"
          control={control}
        />

        <CustomInput 
          name="email"
          rules={{
            required: 'Email is required.',
            pattern: {
              value: EMAIL_REGEX,
              message: 'Invalid email.'
            }
          }}
          placeholder="Email" 
          control={control}
        />

        <CustomInput 
          name="password"
          rules={{
            required: 'Password is required.',
            minLength: {
              value: 6,
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

        <CustomInput 
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

        <CustomInput 
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
          }>Type of property <Text style={{color: 'red'}}>(Required)</Text>
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
        
        
        <CustomInput 
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
        <Text style={[styles.formtext, {alignItems: 'flex-start', color: '#383d3c'}]}>Energy Voucher Code (EVC)</Text>
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
          defaultValue={route.params?.paramKey} 
          control={control}
        />

        <CustomButton
          type='PRIMARY'
          text="Sign Up" 
          onPress={handleSubmit(onSignUpPressed)
          } 
        />

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
    width:"100%",
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
    marginTop:"50%",
  },
  indicatorText: {
    fontSize: 18,
    marginTop: 12,
  },
  loadingAnimation:{
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }

});

export default SignUpScreen;

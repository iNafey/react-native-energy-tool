import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import DropDownPicker from 'react-native-dropdown-picker';
import { IndexPath, Select, SelectItem } from '@ui-kitten/components';
import {useNavigation} from '@react-navigation/core';
import { useForm, Controller } from 'react-hook-form';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
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
  //const [username, setUsername] = useState('');
  //const [email, setEmail] = useState('');
  //const [password, setPassword] = useState('');
  //const [passwordRepeat, setPasswordRepeat] = useState('');
  //const [address, setAddress] = useState('');
  //const [noOfBedrooms, setNoOfBedrooms] = useState('');
  /*
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState();
  const [items, setItems] = useState([
    {label: 'Pick a property type', value: ''},
    {label: 'Detached', value: 'detached'},
    {label: 'Semi-detached', value: 'semi-detached'},
    {label: 'Terraced', value: 'terraced'},
    {label: 'Flat', value: 'flat'},
    {label: 'Cottage', value: 'cottage'},
    {label: 'Bungalow', value: 'bungalow'},
    {label: 'Mansion', value: 'mansion'}
  ]);
  */

  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(2));

  
  const navigation = useNavigation();

  const {control, handleSubmit, formState: {errors}, watch} = useForm({mode: 'onBlur'});
  const watch_password = watch('password');

  const onPickerChangeValue = (value) => {
    //console.log(value);
    //this.setState({bedroom_type: value})
  }


  const onSignUpPressed = (data) => {
    console.log(data);
    //Validate and update Firebase DB
    //navigation.navigate('Login');
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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.root}>
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
        {/*
        <DropDownPicker style={styles.dropdown}
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              options={bedroom_type}
              listMode="SCROLLVIEW"
              onChangeValue={onPickerChangeValue}
            />
            */}

        <Controller
            name="property_type"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => {
              //console.log(value)
              return (
                <Select
                  style={styles.dropdown}
                  placeholder={'Choose a property type*'}
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
        <Text style={{color: 'red', alignSelf: 'stretch', marginBottom: 5}}>*Property type is required to sign up.</Text>
        
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

        <CustomButton 
          text="Sign Up" 
          onPress={handleSubmit(onSignUpPressed)} 
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
      </View>
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
    
    paddingHorizontal: 0,
    marginVertical: 5,
    borderColor: '#e8e8e8',
    width:"100%",
    backgroundColor: '#FFFFFF',
  }
});

export default SignUpScreen;

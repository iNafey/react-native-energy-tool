import { View, TextInput, Image, StyleSheet, useWindowDimensions, ScrollView } from 'react-native'
import React, {useState} from 'react'
import Logo from '../../../assets/images/logo.png'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native'
import { withSafeAreaInsets } from 'react-native-safe-area-context'
import {useForm, Controller} from 'react-hook-form';
import { onChange } from 'react-native-reanimated'


const Login = () => {
  //const [username, setUsername] = useState('');
  //const [password, setPassword] = useState('');

  const {height} = useWindowDimensions();
  const navigation = useNavigation();

  const {control, handleSubmit, formState: {errors}} = useForm();

  const onLoginPressed = (data) => {
    //console.log(data);
    //Validate user
    //navigation.navigate('Home');
  };

  const onSignUpPressed = () => {
    console.log("Go to Sign Up!")
    navigation.navigate('SignUp');
  } 

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.root}>
        <Image 
        source={Logo} 
        style={[styles.logo, {height: height * 0.3}]} 
        resizeMode="contain" 
        />
        
        <CustomInput 
        name="email"
        rules={{
          required: 'Email is required.'
        }}
        placeholder="Email" 
        control={control}
        />
        <CustomInput
        name="password"
        rules={{
          required: 'Password is required.', 
          minLength: {value: 6, message: 'Password should have 6 or more characters.'}}} 
        placeholder="Password" 
        control={control}
        secureTextEntry={true}
        />
        

        <CustomButton 
        text="LOGIN" 
        onPress={handleSubmit(onLoginPressed)}
        />
        <CustomButton 
        text="Don't have an account? Sign Up" 
        onPress={onSignUpPressed} 
        type='TERTIARY' 
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 20,
    color: "#FFFFFF",

  },
  logo: {
    marginVertical: "12%",
    width: "70%",
    maxWidth: 300,
    maxHeight: 300,
  },
})

export default Login
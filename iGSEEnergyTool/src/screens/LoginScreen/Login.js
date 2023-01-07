import { View, Text, Image, StyleSheet, useWindowDimensions, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native'
import React, {useState} from 'react'
import Logo from '../../../assets/images/logo.png'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native'
import { withSafeAreaInsets } from 'react-native-safe-area-context'
import {useForm, Controller} from 'react-hook-form'
import { onChange } from 'react-native-reanimated'
import { firebase } from '../../../firebase/firebase_config'


const Login = () => {
  //const [username, setUsername] = useState('');
  //const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const {height} = useWindowDimensions();
  const navigation = useNavigation();

  const {control, handleSubmit, formState: {errors}} = useForm();

  onLoginPressed = async (data) => {
    setLoading(true);
    try {
      //console.log(data.email, data.password);
      await firebase.auth().signInWithEmailAndPassword(data.email, data.password);
      console.log(data.email, data.password);
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
    //Validate user
    //navigation.navigate('Home');
  };

  const onSignUpPressed = () => {
    console.log("Go to Sign Up!")
    navigation.navigate('SignUp');
  }
  
  function LoadingAnimation() {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" style={styles.indicator}/>
        <Text style={styles.indicatorText}>Signing in...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView>
    <ScrollView showsVerticalScrollIndicator={false}>

    {        
        loading ?
        <LoadingAnimation /> :
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
        type='PRIMARY'
        />

        <CustomButton 
        text="Don't have an account? Sign Up" 
        onPress={onSignUpPressed} 
        type='TERTIARY' 
        />
      </View>}
      
    </ScrollView>
    </SafeAreaView>
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
  indicatorWrapper: {
    flexDirection: "column",
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    marginTop: "50%"
  },
  indicatorText: {
    fontSize: 18,
    marginTop: 12,
  },
})

export default Login
import { View, Text, Image, StyleSheet, useWindowDimensions, ScrollView, ActivityIndicator, SafeAreaView, Alert } from 'react-native'
import React, {useState} from 'react'
import Logo from '../../../assets/images/logo.png'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton'
import { useNavigation } from '@react-navigation/native'
import {useForm} from 'react-hook-form'
import { firebase } from '../../../firebase/firebase_config'
import { sha256 } from 'react-native-sha256';

let encryptedPassword = "";

const Login = () => {
  //const [username, setUsername] = useState('');
  //const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [invalidDetails, setInvalidDetails] = useState(false);

  const {height} = useWindowDimensions();
  const navigation = useNavigation();

  const {control, handleSubmit, formState: {errors}} = useForm();

  function sleep(time){
    return new Promise((resolve)=>setTimeout(resolve,time)
  )
  }
  
  const onHashPassword = (data)  => {
    setInvalidDetails(false);
    setLoading(true);
    
    sha256(data.password).then((hash) => {
      encryptedPassword=hash;      
      //console.log(pwd);    
    });

    sleep(1000).then(()=>{
      onLoginPressed(data);
   })
    
  }

  onLoginPressed = async (data) => {
    try {
      //console.log(data.email, data.password);
      await firebase.auth().signInWithEmailAndPassword(data.email, encryptedPassword)
      .catch(error => {
        switch(error.code) {
          case 'auth/user-not-found':
            setInvalidDetails(true);
          case 'auth/wrong-password':
            setInvalidDetails(true);
        }
      })
      console.log(data.email, encryptedPassword);
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
          minLength: {value: 5, message: 'Password should have 5 or more characters.'}}} 
        placeholder="Password" 
        control={control}
        secureTextEntry={true}
        />
        

        <CustomButton 
        text="LOGIN" 
        onPress={handleSubmit(onHashPassword)}
        type='PRIMARY'
        />

        { invalidDetails ? (
          <Text style={{color: "red"}}>Invalid email or password</Text>
        ) : null }

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
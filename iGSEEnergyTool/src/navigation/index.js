import { View, Text, StyleSheet } from 'react-native'
import React, {useState, useEffect} from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { firebase } from '../../firebase/firebase_config';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanVoucherScreen from '../screens/ScanVoucher';
import UploadReadingScreen from '../screens/UploadReadingScreen';
import BillScreen from '../screens/BillScreen';
import TopUpScreen from '../screens/TopUpScreen';
import AdminScreen from '../screens/AdminScreen/AdminScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from '@ui-kitten/components';
import Ionicons from 'react-native-vector-icons/Ionicons';

//Screen names
const homeName = 'Home';
const billName = 'Bill';
const uploadReadingName = 'New Reading';
const topUpName = 'Credit';

const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();

const Navigation = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  

  //Handle user state change

  function onAuthStateChanged(user){
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber =  firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  },[]);

  if (initializing) return null;

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown:false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ScanVoucher" component={ScanVoucherScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (user.email === "gse@shangrila.gov.un") {
    console.log("This is the admin!");
    return(
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown:false}}>
          <Stack.Screen name="AdminDashboard" component={AdminScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {/*
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
      */}

      <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({route})  => ({
        headerShown:false,
        tabBarIcon:({focused, color, size}) => {
          let iconName;
          let rn = route.name;

          if (rn === homeName){
            iconName = focused ? 'home' : 'home-outline'
          } else if (rn === uploadReadingName){
              iconName = focused ? 'create' : 'create-outline'
          } else if (rn === billName){
              iconName = focused ? 'document-text' : 'document-text-outline'
          }  else if (rn === topUpName){
              iconName = focused ? 'wallet' : 'wallet-outline'
          }

          return <Ionicons name={iconName} size={size} color={color}></Ionicons>
        },
        tabBarLabelStyle: {paddingBottom: 10, fontSize: 10},
        tabBarStyle: {padding: 10, height: 70},
      })}
      >

        <Tab.Screen name={homeName} component={HomeScreen} />
        <Tab.Screen name={uploadReadingName} component={UploadReadingScreen} />
        <Tab.Screen name={billName} component={BillScreen} />
        <Tab.Screen name={topUpName} component={TopUpScreen} />


      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default Navigation;


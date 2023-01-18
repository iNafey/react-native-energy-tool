import { SafeAreaView, View, Text, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { firebase } from '../../../firebase/firebase_config'
import { Button } from '@ui-kitten/components';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

//All tab icons used for easier navigation and better user experience
const MeterIcon = () => (
  <Ionicons name="speedometer-outline" size={30}></Ionicons>
);

const BillIcon = () => (
  <Ionicons name="document-text-outline" size={30}></Ionicons>
);

const WalletIcon = () => (
  <Ionicons name="wallet-outline" size={30}></Ionicons>
);


const Home = () => {
  const [user, setUser] = useState('');

  const navigation = useNavigation();

  //Get current user data and output a welcome greeting with the user's username. "Hello $username"
  useEffect(() => {
    firebase.firestore().collection('users')
      .doc(firebase.auth().currentUser.uid).get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setUser(snapshot.data())
        } else {
          console.log("User does not exist!");
        }
      });
  }, []);

  //Navigation handling to other screens (bottom tab navigation)
  const goToMeterReadings = () => {
    navigation.navigate('Meter');
  }

  const goToBills = () => {
    navigation.navigate('Bill');
  }

  const goToCredit = () => {
    navigation.navigate('Credit');
  }


  return (
    <SafeAreaView style={styles.content}>
      <View style={styles.topRow}>
        <Animated.View
          entering={FadeInUp.delay(500).duration(1000)}
        >
          <Text style={styles.welcomeinfo}>
            Hello {user.userName}!
          </Text>
        </Animated.View>


      </View>

      <View style={styles.meterRow}>
        <View style={styles.btnContainer}>
          <Button style={styles.iconBtn} appearance='outline' status='info' accessoryLeft={MeterIcon} onPress={goToMeterReadings} />
        </View>
        <Text style={styles.paraText}> Add meter readings</Text>
      </View>

      <View style={styles.billRow}>
        <View style={styles.btnContainer}>
          <Button style={styles.iconBtn} appearance='outline' status='info' accessoryLeft={BillIcon} onPress={goToBills} />
        </View>
        <Text style={styles.paraText}> Pay outstanding bills</Text>
      </View>

      <View style={styles.creditRow}>
        <View style={styles.btnContainer}>
          <Button style={styles.iconBtn} appearance='outline' status='info' accessoryLeft={WalletIcon} onPress={goToCredit} />
        </View>
        <Text style={styles.paraText}> Top up energy credit</Text>
      </View>

      <View style={[styles.btnContainer, { justifyContent: "center", alignItems: "center", marginTop: 60 }]}>
        <Button
          style={styles.button}
          status='danger'
          onPress={() => { firebase.auth().signOut() }}
        >
          LOGOUT
        </Button>
      </View>


    </SafeAreaView>

  )

}

const styles = StyleSheet.create({
  content: {
    margin: 15,
  },
  welcomeinfo: {
    //margin: 15,
    fontWeight: 'bold',
    fontSize: 24,
    color: '#484c4a',
  },
  welcomeContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  button: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center"
    //width: 120,
  },
  logoutContainer: {
    flexWrap: "wrap",
    alignItems: "flex-end",
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  meterRow: {
    marginTop: 60,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
  },

  billRow: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
  },

  creditRow: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
  },

  btnContainer: {
    flexDirection: "row",
    flexWrap: 'wrap',
  },

  paraText: {
    fontSize: 18,
    marginTop: 20,
    color: '#485450'
  },
});

export default Home
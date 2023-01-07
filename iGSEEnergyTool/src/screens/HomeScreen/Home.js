import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { firebase } from '../../../firebase/firebase_config'
import { Button, Layout } from '@ui-kitten/components';

const Home = () => {
  const [user, setUser] = useState('');

  useEffect(() => {
    firebase.firestore().collection('users')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setUser(snapshot.data())
      }else {
        console.log("User does not exist!");
      }
    });
  },[]);


  return (
    <SafeAreaView>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.welcomeinfo}>
            Hello {user.userName}!
          </Text>
        </View>

        <View>
          <Button 
            style={styles.button} 
            appearance='outline' 
            status='danger'
            onPress={() => {firebase.auth().signOut()}}
            >
            LOGOUT
          </Button>
        </View>
      </View>

      <Text>You can start laying out here...</Text>

    </SafeAreaView>

  )

}

const styles = StyleSheet.create({
  welcomeinfo: {
    margin: 15,
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
    margin: 5,
    width: 100,
    paddingVertical: 5,
  },
  logoutContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  }
});

export default Home
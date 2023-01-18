# react-native-energy-tool


## Overview

The inspiration behind this app is for the following reasons:
 
* I wanted to work on a react native project to learn about hybrid/native mobile app development.
* Main purpose of the project is to create an energy tool with authentication, authorisation and ability for customers to add metered energy readings, view latest unpaid bill(s) and top up their energy credit using energy voucher codes.
* App also offers an admin account to set energy tariff values (upon which the bills will be generated), view all meter readings submitted by users and get average energy statistics (by date).
* Additionally, there's also a Rest API to get general info on types of properties the users own and energy statistics.
* There is a unique form of payment using EVC energy vouchers (Can be scanned in app via QR codes or an 8-digit text input). This is meant to replace traditional card payment system with a coupon based approach.

### App functionalities (up to this point):

* All the features below work on both Android and iOS. 
* Working login and registration with validation (using react form hooks).
* Working vision camera and QR/Barcode scanner.
* Firebase user authentication and Firestore database for storing user data.
* Admin and Customer profiles (authorisation) is setup. Which includes different screens for admin as compared to a regular user.
* Bottom tab navigator implemented.
* Loading screen (Activity Indicator) setup to display during firebase transactions.
* Add meter readings, view latest paid bills and top up credit functionality added. (All bugs fixed)
* Admin account now has the ability to view all meter readings, set energy rates, and view energy statistics (by date). (All bugs fixed)
* Rest API with GET requests to fetch all properties owned by current users and also to obtain average energy cost per day for a specific property type (input) with a certain number of bedrooms (input).

## Instructions for running the app
1. Set up your physical/virtual device by heading over to this webpage "https://reactnative.dev/docs/environment-setup". Then choose "React Native CLI Quickstart" option and then Development OS (your machine) and Target OS (your mobile device). Follow all the steps within the "Installing dependencies" section so that the app can be configured to your mobile device.
2. For Android: 
- If you are using an Android Virtual Device from Android Studio then power it. Navigate to iGSE folder and copy and run ```npm i && npx react-native run-android```
- If you want to run on a physical Android device then open Android Studio, connect phone to your machine either with a cable (preferred) or WiFI and do settings > developer options > usb debugging (enabled). Finally, go to iGSE folder and run ```npm i && npx react-native run-android```
3. For iOS (only for macOS users):
- If you want to run on an iOS emulator, make sure you have Xcode installed. In the iGSE folder, copy and run the command ```npm i && cd ios && pod install && cd .. && npx react-native run-ios```
- For a physical iOS device, install Xcode and go to this page "https://reactnative.dev/docs/environment-setup", choose "React Native CLI Quickstart" option, choose Development OS: macOS and Target OS: iOS. Follow "Installing dependencies" section but don't install iOS simulator (you just need node, watchman and ruby). Scroll down to find "Running on device" sub-section and follow the link and complete the given steps. Once you finish that you can go into iGSE folder and run the command ```npm i && cd ios && pod install && cd .. && npx react-native run-ios```

## Instructions for the Rest API (removed secret keys so database inaccesible but these steps are to be followed in an ideal environment)
1. Install node and npm
2. Open a terminal and navigate to igseRestAPI folder and run the command ```npm i && npm start```
3. Use a Postman Client or any other API client to send https requests to the Nodemon server.
4. There are 2 API endpoints: GET ```http://localhost:8080/igse/propertycount``` and GET ```http://localhost:8080/igse/property_type/bedrooms``` where property_type can be "Detached, Semi-detached, Flat, Cottage, Mansion, Terraced and Bungalow" and bedrooms can only be a natural number (1,2,3,...)

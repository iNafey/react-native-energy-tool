# react-native-energy-tool


## Overview

The inspiration behind this app is for the following reasons:
 
* I wanted to work on a react native project to learn about hybrid/native development.
* Main purpose of the project is to create an energy tool with authentication, authorisation and ability for customers to add metered energy readings, view latest unpaid bill(s) and top up their energy credit using energy voucher codes.
* App also offers an admin account to set energy tariff values (upon which the bills will be generated), view all meter readings submitted by users and get average energy statistics (by date).
* There is a unique form of payment using EVC energy vouchers (Can be scanned in app via QR codes or an 8-digit text input). This is meant to replace traditional card payment system with a coupon like payment system.

### App functionalities (up to this point):

* All the features below work on both Android and iOS. 
* Working login and registration with validation (using react form hooks).
* Working vision camera and QR/Barcode scanner.
* Firebase user authentication.
* Admin and Customer profiles (authorization) is setup. Which includes different screens for admin as compared to a regular user.
* Bottom tab navigator implemented.
* Loading screen (Activity Indicator) setup to display during firebase transactions.
* Add meter readings, view latest paid bills and top up credit functionality added. (Minor bugs exist but will be patched later)
* Admin account now has the ability to view all meter readings, set energy rates, and view energy statistics (by date). (Minor bugs exist but will be patched later)

##Instructions on running the app
1. Set up your physical/virtual device by heading over to this webpage "https://reactnative.dev/docs/environment-setup". Then choose "React Native CLI Quickstart" option and then Development OS (your machine) and Target OS (your mobile device). Follow all the steps within the. "Installing dependencies" section so that the app can be configured to your mobile device.
2. For ANDROID: 
- If you are using an Android Virtual Device from Android Studio then power it. Navigate to iGSE folder and copy and run "npm i && npx react-native run-android".
- If you want to run on a physical Android device then open Android Studio, connect phone to your machine either with a cable (preferred) or WiFI and do settings > developer options > usb debugging (enabled). Finally, go to iGSE folder and run "npm i && npx react-native run-android".
3. For iOS (only for macOS users):
- If you want to run on an iOS emulator, make sure you have Xcode installed. In the iGSE folder, copy and run the command "npm i && cd ios && pod install && cd .. && npx react-native run-ios".
- For a physical iOS device, go to this page "https://reactnative.dev/docs/environment-setup", choose "React Native CLI Quickstart" option, choose Development OS: macOS and Target OS: iOS. Follow "Installing dependencies" section but don't install iOS simulator (you just need node, watchman and ruby). Scroll down to find "Running on device" and go to the link and follow those steps. Once you finish that you can go into iGSE folder and run the command "npm i && cd ios && pod install && cd .. && npx react-native run-ios".

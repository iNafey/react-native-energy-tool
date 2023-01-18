import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCameraDevices } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { useNavigation } from '@react-navigation/native';
import { Svg, Defs, Rect, Mask } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScanVoucher() {
  const [hasPermission, setHasPermission] = React.useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  const [qrcode, setQRCode] = React.useState('');
  const [isScanned, setIsScanned] = React.useState(false);


  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  const navigation = useNavigation();

  //Call this only once when the component is mounted to request camera permission
  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  //Call this whenever the barcodes array value changes
  React.useEffect(() => {
    toggleActiveState();
  }, [barcodes])

  //Function to get the correct barcode value once a code is detected
  const toggleActiveState = async () => {
    if (barcodes && barcodes.length > 0 && isScanned === false) {
      setIsScanned(true);

      barcodes.forEach(async (scannedBarcode) => {
        if (scannedBarcode.rawValue !== "") {
          setQRCode(scannedBarcode.rawValue);
          console.log(scannedBarcode.rawValue);

          navigateBack(scannedBarcode.rawValue);
        }
      });
    }
  }

  //Navigate to previous screen, either Sign Up or Top up.
  const navigateBack = async (qrcode) => {
    try {
      const value = await AsyncStorage.getItem('navigatedFrom')
      if (value !== null) {
        // value previously stored
        navigation.navigate(value, {
          paramKey: qrcode,
        });
      }
    } catch (e) {
      // error reading value
      alert(e);
    }
  }


  //Masked camera frame for user to focus the code in the clear box.
  function CameraFrame() {
    return (

      <Svg
        height="100%"
        width="100%">
        <Defs>
          <Mask
            id="mask"
            x="0"
            y="0"
            height="100%"
            width="100%">
            <Rect height="100%" width="100%" fill="#fff" />

            <Rect
              x="20%"
              y="30%"
              height="250"
              width="250"
              fill="black"
            />

          </Mask>
        </Defs>
        <Rect
          height="100%"
          width="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#mask)"
        />

        <Rect
          x="20%"
          y="30%"
          height="250"
          width="250"
          strokeWidth="5"
          stroke="#fff"
        />
      </Svg>
    )
  }



  return (
    device != null &&
    hasPermission && (
      <>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
        {/*
        <View style={styles.codeBox}>
        {barcodes.map((barcode, idx) => (
          
          <Text key={idx} style={styles.barcodeTextURL}>
            {barcode.displayValue}
          </Text>     
        ))}
        </View>
        */}

        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>

          {/* Focus box effect: (If you want this effect make sure to uncomment the line below, camera performance may degrade!)*/}
          {/* <CameraFrame /> */}



          {/* Top label*/}
          <View
            style={{
              position: "absolute",
              top: "15%",
              left: 0,
              right: 0,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#557bfe", }}>
              Scan...
            </Text>
          </View>

          {/* Bottom label */}
          <View
            style={{
              position: "absolute",
              bottom: "20%",
              left: 0,
              right: 0,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "normal", color: "#557bfe", }}>
              Align code in the middle
            </Text>
          </View>
        </View>
      </>
    )
  );
}

const styles = StyleSheet.create({
  barcodeTextURL: {
    fontSize: 28,
    color: '#23ff00',
    fontWeight: 'bold',
    marginBottom: 15,

  },

  codeBox: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  }
});
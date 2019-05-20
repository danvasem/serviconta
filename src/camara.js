import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, TextInput, ToastAndroid, Platform } from "react-native";
import { RNCamera } from "react-native-camera";

export default class Camara extends Component {
  static navigationOptions = {
    title: "CAPTURAR IMÁGEN",
    headerStyle: {
      backgroundColor: "#00bfa5"
    },
    headerTintColor: "white",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  };

  state = {
    liveCamera: true,
    showPictureCaptuerd: false,
    pictureCapturedData: null,
    imageName: null
  };

  handlePictureCaptured = data => {
    this.setState({
      liveCamera: false,
      showPictureCaptuerd: true,
      pictureCapturedData: data
    });
    console.log(data.uri);
  };

  handleReturnCamera = () => {
    this.setState({
      liveCamera: true,
      showPictureCaptuerd: false,
      pictureCapturedData: null
    });
  };

  handleAceptar = () => {
    this.props.navigation.navigate("RegistrarTramite", {
      imagenCapturada: this.state.pictureCapturedData
    });
  };

  render() {
    if (this.state.liveCamera) {
      return <LiveCamera onPictureCaptured={this.handlePictureCaptured} />;
    } else if (this.state.showPictureCaptuerd) {
      if (this.state.pictureCapturedData) {
        return (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <Image
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain"
                }}
                source={this.state.pictureCapturedData}
              />
            </View>
            <View
              style={{
                height: 100,
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "white"
              }}>
              <TouchableOpacity onPress={this.handleReturnCamera} style={styles.capture}>
                <Text style={{ fontSize: 14, color: "white", fontWeight: "bold" }}> CAMARA -> </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.handleAceptar} style={styles.capture}>
                <Text style={{ fontSize: 14, color: "white", fontWeight: "bold" }}> ACEPTAR </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }
    }
  }
}

class LiveCamera extends React.Component {
  handleCapture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      this.props.onPictureCaptured(data);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: "Permission to use camera",
            message: "We need your permission to use your camera",
            buttonPositive: "Ok",
            buttonNegative: "Cancel"
          }}
          androidRecordAudioPermissionOptions={{
            title: "Permission to use audio recording",
            message: "We need your permission to use your audio",
            buttonPositive: "Ok",
            buttonNegative: "Cancel"
          }}
          onGoogleVisionBarcodesDetected={({ barcodes }) => {
            console.log(barcodes);
          }}
        />
        <View
          style={{
            flex: 0,
            flexDirection: "row",
            justifyContent: "center"
          }}>
          <TouchableOpacity onPress={this.handleCapture} style={styles.capture}>
            <Text style={{ fontSize: 14, color: "white", fontWeight: "bold" }}> CAPTURAR </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black"
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  capture: {
    height: 60,
    backgroundColor: "#00bfa5",
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    margin: 20
  }
});

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  DatePickerAndroid,
  ToastAndroid,
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";
import { NavigationEvents } from "react-navigation";

class RegistrarTramite extends React.Component {
  static navigationOptions = {
    title: "NUEVO TRÁMITE",
    headerStyle: {
      backgroundColor: "blue"
    },
    headerTintColor: "white",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  };

  state = {
    loading: false,
    data: {}
  };

  constructor(props) {
    super(props);
    this.navigation = this.props.navigation;
  }

  handleCapturarImagen = () => this.navigation.navigate("Camara");

  handleDatePicker = async () => {
    let fecha = await DatePickerAndroid.open();
    if (fecha) {
      this.handleInputData("fecha", `${fecha.day}/${fecha.month + 1}/${fecha.year}`);
    }
  };

  handleInputData = (campo, texto) => {
    if (campo == "subtotal") {
      this.setState({
        ...this.state,
        data: {
          ...this.state.data,
          subtotal: texto,
          iva: (parseFloat(texto) * 0.12).toFixed(2),
          total: (parseFloat(texto) * 1.12).toFixed(2)
        }
      });
    } else {
      this.setState({
        ...this.state,
        data: {
          ...this.state.data,
          [campo]: texto
        }
      });
    }
    console.log(this.state.data);
  };

  validarDatosRequeridos = () => {
    const { nombre, fecha, subtotal, iva, total, imagenCapturada } = this.state.data;
    if (!nombre || !fecha || !subtotal || !iva || !total) {
      alert("Favor ingrese todos los datos");
      return false;
    }
    if (!imagenCapturada) {
      alert("Favor captura una imágen");
      return false;
    }
    return true;
  };

  guardarRegistro = async () => {
    if (!this.validarDatosRequeridos()) return;
    this.setState({
      ...this.state,
      loading: true
    });
    const url = "https://eono9vsnk6.execute-api.us-east-1.amazonaws.com/TEST/transaccion";
    try {
      const call = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          image: this.state.data.imagenCapturada.base64,
          imageName: `${this.state.data.nombre}.jpg`,
          nombre: this.state.data.nombre,
          fecha: this.state.data.fecha,
          subtotal: this.state.data.subtotal,
          iva: this.state.data.subtotal,
          total: this.state.data.total,
          estado: "Ingresado"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      const res = await call.json();
      console.log("Respuesta exitosa!", res);
      this.setState({
        ...this.state,
        loading: false
      });
      Alert.alert(
        "SERVICONTA",
        "Trámite registrado con éxito",
        [
          {
            text: "OK",
            onPress: () =>
              this.navigation.navigate("Home", {
                registroNuevo: true
              })
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      ToastAndroid.show("Se presentó un problema. Favor inténtalo más tarde.", ToastAndroid.LONG);
      console.log("Error en la llamada", error);
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <NavigationEvents
          onWillFocus={payload => {
            console.log(payload);
            if (payload.action.params) this.handleInputData("imagenCapturada", payload.action.params.imagenCapturada);
          }}
        />
        <Modal
          animationType="none"
          transparent
          visible={this.state.loading}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}>
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              flex: 1,
              alignItems: "center",
              justifyContent: "center"
            }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        </Modal>
        <CampoTexto name="nombre" label="Nombre:" handleInputData={this.handleInputData} dataStore={this.state.data} />
        <CampoTexto
          name="fecha"
          label="Fecha:"
          handleInputData={this.handleInputData}
          onFocus={this.handleDatePicker}
          dataStore={this.state.data}
        />
        <CampoMonetario
          name="subtotal"
          label="Sub-total:"
          handleInputData={this.handleInputData}
          dataStore={this.state.data}
        />
        <CampoMonetario
          name="iva"
          label="IVA 12%:"
          handleInputData={this.handleInputData}
          dataStore={this.state.data}
        />
        <CampoMonetario
          name="total"
          label="Total:"
          handleInputData={this.handleInputData}
          dataStore={this.state.data}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={this.handleCapturarImagen}>
            <View style={styles.inputButton}>
              <Text style={{ color: "white" }}>Capturar Imágen</Text>
            </View>
          </TouchableOpacity>
        </View>
        {this.state.data.imagenCapturada && (
          <View style={{ flex: 1, margin: 10 }}>
            <Image
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "contain"
              }}
              source={this.state.data.imagenCapturada}
            />
          </View>
        )}
        <View style={styles.saveContainer}>
          <TouchableOpacity onPress={this.guardarRegistro}>
            <View style={styles.saveBtn}>
              <Text style={{ color: "white", fontWeight: "bold" }}>GUARDAR</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

function CampoTexto(props) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={text => props.handleInputData(props.name, text)}
        value={props.dataStore[props.name]}
        onFocus={props.onFocus}
      />
    </View>
  );
}

function CampoMonetario(props) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.moneyInput}
        onChangeText={text => props.handleInputData(props.name, text)}
        value={props.dataStore[props.name]}
        onFocus={props.onFocus}
        keyboardType="decimal-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    height: 40,
    flexDirection: "row",
    margin: 10,
    alignItems: "center"
  },
  label: { width: 70 },
  textInput: {
    flex: 1,
    borderColor: "grey",
    borderWidth: 1,
    marginRight: 20,
    borderRadius: 5
  },
  moneyInput: {
    width: 80,
    borderColor: "grey",
    borderWidth: 1,
    marginRight: 20,
    borderRadius: 5
  },
  inputButton: {
    height: 40,
    width: 120,
    backgroundColor: "#00bfa5",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5
  },
  saveContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  saveBtn: {
    margin: 20,
    height: 40,
    width: 200,
    backgroundColor: "blue",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default RegistrarTramite;

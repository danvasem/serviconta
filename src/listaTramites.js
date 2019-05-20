import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  Platform
} from "react-native";
import { NavigationEvents } from "react-navigation";
import Firebase from "react-native-firebase";

export default class ListaTramites extends React.Component {
  static navigationOptions = {
    title: "MIS TRÁMITES",
    headerStyle: {
      backgroundColor: "blue"
    },
    headerTintColor: "white",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  };

  state = {
    loadingTramites: true,
    showImagen: false,
    showImagenUrl: null,
    tramites: []
  };

  componentDidMount() {
    this.cargarListaTramites();
    this.inicializarFirebase();
    this.inicializarEventosNotificaciones();
  }

  componentWillUnmount() {
    console.log("WillUnmount");
    this.unsuscribeOnTokenRefreshListener();
    this.unsuscribeMessageListener();
    this.unsuscribeNotificationDisplayedListener();
    this.unsuscribeNotificationListener();
  }

  registrarEndpointDispositivo = async token => {
    const url = "https://eono9vsnk6.execute-api.us-east-1.amazonaws.com/TEST/usuario-dispositivo";
    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          token
        })
      });
      const data = await res.json();
      console.log("Endpoint registrado exitosamente en AWS", data);
    } catch (error) {
      console.log("Error al registrar el Endpoint en AWS", error);
    }
  };

  inicializarFirebase = async () => {
    const fcmToken = await Firebase.messaging().getToken();
    console.log("Firebase Token: " + fcmToken);
    await this.registrarEndpointDispositivo(fcmToken);
    const permiso = await Firebase.messaging().hasPermission();
    if (permiso) console.log("Permiso PUSH concedido!!");
    else {
      console.log("Permiso PUSH no ha sido concedido");
      try {
        await Firebase.messaging().requestPermission();
        console.log("Permiso PUSH concedido!!");
      } catch {
        console.log("Permiso denegado: " + error);
      }
    }
  };

  inicializarEventosNotificaciones = () => {
    //Para escuchar la actualización del refresh token de Firebase
    this.unsuscribeOnTokenRefreshListener = Firebase.messaging().onTokenRefresh(fcmToken => {
      this.registrarEndpointDispositivo(fcmToken);
    });

    //Para el caso de ANdroid 8.0 o superior (API 26 + ) aplica la creaicón de canales de notificaciones
    if (Platform.Version >= 26) {
      const channel = new Firebase.notifications.Android.Channel(
        "serviconta",
        "Serviconta",
        Firebase.notifications.Android.Importance.Max
      ).setDescription("Notificaciones de Serviconta");

      // Create the channel
      Firebase.notifications().android.createChannel(channel);
      console.log(channel);
    }

    //Lo siguiente devuelve un Unsuscribe function
    this.unsuscribeMessageListener = Firebase.messaging().onMessage(message => {
      console.log("Mensaje recibido: " + JSON.stringify(message));
      console.log("Datos recibidos: " + JSON.stringify(message._data));
      const data = JSON.parse(message._data.default).message;
      console.log("Mensaje: " + data);

      const notification = new Firebase.notifications.Notification()
        .setNotificationId((this.contador++).toString())
        .setTitle("Serviconta")
        .setBody(data)
        .android.setChannelId("serviconta");
      // .setData({
      //   ...data
      // });
      notification.android.setAutoCancel(true); //Para cerrar automáticamente la notificación cuando se dio clic en ella.
      notification.android.setBigText(data);
      Firebase.notifications().displayNotification(notification);

      //Actualizamos la lista
      this.cargarListaTramites();
    });

    //Cuando una notificacion es presentada, es decir aparece en la barra de notificaciones
    this.unsuscribeNotificationDisplayedListener = Firebase.notifications().onNotificationDisplayed(notification => {
      console.log("Notificacion presentada: ");
    });

    //Cuando una notificación es recibida pero no presentada:
    this.unsuscribeNotificationListener = Firebase.notifications().onNotification(notification => {
      console.log("Notificacion recibida: ");
    });

    //Cuando una notificación es tapped/abierta
    this.unsuscribeNotificationOpenedListener = Firebase.notifications().onNotificationOpened(notification => {
      const action = notification.action; //EN caso de que se haya indicado una acci�n
      const data = notification.notification.data;
      console.log("Notificacion abierta: " + JSON.stringify(data));

      //Para quitar la notificación cuando ya se dió clic en ella:
      //firebase.notifications().removeDeliveredNotification("notificationId");
    });
  };

  handleNuevoTramite = () => {
    this.props.navigation.navigate("RegistrarTramite");
  };

  handleCapturar = () => {
    this.props.navigation.navigate("Camara");
  };

  cargarListaTramites = async () => {
    try {
      const api = await fetch("https://eono9vsnk6.execute-api.us-east-1.amazonaws.com/TEST/transacciones");
      const data = await api.json();
      this.setState({
        tramites: data,
        loadingTramites: false
      });
    } catch (error) {
      console.log("Error en la invocación a lista de trámites", error);
    }
  };

  renderLabelTexto = (label, texto, prefijoTexto = "") => (
    <Text style={{ fontWeight: "bold" }}>
      {`${label}: `}
      <Text style={{ fontWeight: "normal" }}>{`${prefijoTexto}${texto}`}</Text>
    </Text>
  );

  tramitesRenderItems = ({ item }) => (
    <View
      style={{
        width: "100%",
        height: 150,
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 20,
        marginBottom: 10,
        padding: 10,
        flexDirection: "row"
      }}
      key={item.nombre}>
      <View style={{ width: 150 }}>
        {this.renderLabelTexto("Nombre", item.nombre)}
        {this.renderLabelTexto("Fecha", item.fecha)}
        {this.renderLabelTexto("Subtotal", item.subtotal, "$ ")}
        {this.renderLabelTexto("IVA", item.iva, "$ ")}
        {this.renderLabelTexto("Total", item.total, "$ ")}
        <Text
          style={
            item.estado == "Validado"
              ? {
                  color: "green",
                  fontWeight: "bold"
                }
              : {
                  color: "blue",
                  fontWeight: "normal"
                }
          }>
          {item.estado}
        </Text>
      </View>
      <View style={{ flex: 2 }}>
        <TouchableOpacity
          onPress={() => {
            this.setState({
              ...this.state,
              showImagen: true,
              showImagenUrl: item.imagenUrl
            });
          }}>
          <Image style={{ width: "100%", height: "100%", resizeMode: "contain" }} source={{ uri: item.imagenUrl }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  render() {
    return (
      <View style={styles.container}>
        <NavigationEvents
          onWillFocus={payload => {
            if (payload && payload.action.params && payload.action.params.registroNuevo) this.cargarListaTramites();
          }}
        />
        <Modal
          animationType="fade"
          transparent
          visible={this.state.showImagen}
          onRequestClose={() => {
            this.setState({ ...this.state, showImagen: false, showImagenUrl: null });
          }}>
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              flex: 1,
              alignItems: "center",
              justifyContent: "center"
            }}>
            <Image
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
              source={{ uri: this.state.showImagenUrl }}
            />
          </View>
        </Modal>
        <View style={{ heigth: 40, width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={this.handleNuevoTramite}>
            <View style={styles.button}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Nuevo Trámite</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.handleCapturar}>
            <View style={styles.button}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Capturar</Text>
            </View>
          </TouchableOpacity>
        </View>
        {this.state.loadingTramites ? (
          <View
            style={{
              height: "100%",
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "center",
              marginTop: 20
            }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          this.state.tramites.length > 0 && (
            <View style={{ width: "100%", marginTop: 10, marginBottom: 10 }}>
              <FlatList
                style={{ marginBottom: 40 }}
                data={this.state.tramites}
                renderItem={this.tramitesRenderItems}
                keyExtractor={item => item.nombre}
                onRefresh={this.cargarListaTramites}
                refreshing={this.state.loadingTramites}
              />
            </View>
          )
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    margin: 10
  },
  button: {
    height: 40,
    width: 120,
    backgroundColor: "#00bfa5",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    color: "white"
  }
});

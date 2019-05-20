import { createStackNavigator, createAppContainer } from "react-navigation";
import RegistrarTramite from "./registrarTramite";
import Camara from "./camara";
import ListaTramites from "./listaTramites";

const Main = createStackNavigator(
  {
    Home: ListaTramites,
    RegistrarTramite: RegistrarTramite,
    Camara: Camara
  },
  {
    initialRouteName: "Home"
  }
);

export default createAppContainer(Main);

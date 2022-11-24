import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import HotelList from "./pages/hotels/HotelList";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import HotelDetails from "./pages/hotel/HotelDetails";
import { HotelItemsProvider } from "./providers/HotelItemsProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { Login } from "./pages/login/login";
import { PrivateRoute } from "./pages/login/PrivateRoute";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>

        <AuthProvider>
          <Route path="/login" component={Login} exact={true} />
          <HotelItemsProvider>
            <PrivateRoute path="/home" component={HotelList} exact={true} />
            <PrivateRoute path="/" component={HotelList} exact={true} />
            <PrivateRoute path="/item" component={HotelDetails} exact={true} />
            <PrivateRoute path="/item/:id" component={HotelDetails} exact={true} />
          </HotelItemsProvider>
        </AuthProvider>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

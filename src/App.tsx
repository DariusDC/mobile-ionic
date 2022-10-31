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

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <HotelItemsProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home" component={HotelList} />
          <Route exact path="/item" component={HotelDetails} />
          <Route exact path="/item/:id" component={HotelDetails} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </HotelItemsProvider>
  </IonApp>
);

export default App;

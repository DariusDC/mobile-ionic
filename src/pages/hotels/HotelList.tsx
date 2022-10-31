import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext } from "react";
import { RouteComponentProps } from "react-router";
import HotelItem from "../../components/HotelItem/HotelItem";
import { Hotel } from "../../models/Hotel";
import { HotelItemsContext } from "../../providers/HotelItemsProvider";
import "./HotelList.css";
import { useHotels } from "./useHotels";
import { add } from "ionicons/icons";

const HotelList: React.FC<RouteComponentProps> = ({ history }) => {
  const { items, fetching, fetchingError } = useContext(HotelItemsContext);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hotels</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonLoading isOpen={fetching} message="Fetching the hotels" />
        <IonList>
          {items &&
            items.map((hotel) => (
              <HotelItem
                key={hotel.id}
                hotel={hotel}
                id={hotel.id}
                onTap={(id) => history.push(`/item/${id}`)}
              />
            ))}
        </IonList>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push("/item")}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default HotelList;

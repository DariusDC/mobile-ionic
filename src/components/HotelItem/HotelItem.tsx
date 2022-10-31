import {
  IonCol,
  IonGrid,
  IonImg,
  IonItem,
  IonLabel,
  IonRow,
} from "@ionic/react";
import React from "react";
import { Hotel } from "../../models/Hotel";
import { HotelsProps } from "../../pages/hotels/useHotels";
import "./HotelItem.css";

export interface HotelProps {
  hotel: Hotel;
  id?: string;
  onTap: (id?: string) => void;
}

const HotelItem: React.FC<HotelProps> = ({ hotel, id, onTap }) => {
  return (
    <IonGrid id={id} onClick={() => onTap(id)}>
      <IonRow>
        <IonCol>
          <IonImg src={hotel.imageURL} />
        </IonCol>
        <IonCol>
          <IonLabel>{hotel.name}</IonLabel>
          <br />
          <IonLabel className="hotelDesc">{hotel.desc}</IonLabel>
          <br />
          <br />
          <IonLabel className="hotemRoomNR">
            {hotel.added.toDateString()}
          </IonLabel>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default HotelItem;

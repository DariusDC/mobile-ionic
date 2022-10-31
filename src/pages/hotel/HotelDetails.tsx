import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Hotel } from "../../models/Hotel";
import { HotelItemsContext } from "../../providers/HotelItemsProvider";

interface Props
  extends RouteComponentProps<{
    id?: string;
  }> {}

interface HotelData {
  description: string;
  imageURL: string;
  price: number;
  name: string;
  added: Date;
  available: boolean;
}

const HotelDetails: React.FC<Props> = ({ history, match }) => {
  const { items, saving, saveItem, savingError } =
    useContext(HotelItemsContext);
  const [item, setItem] = useState<Hotel>();
  const [hotelData, setHotelData] = useState<HotelData>({
    description: "",
    name: "",
    imageURL: "",
    price: 0,
    added: new Date(),
    available: false,
  });

  useEffect(() => {
    const routeId = match.params.id || "";
    const item = items?.find((it) => it.id === routeId);

    setItem(item);
    if (item) {
      setHotelData({
        description: item.desc,
        imageURL: item.imageURL,
        price: item.price,
        name: item.name,
        added: item.added,
        available: item.available,
      });
    }
  }, [match.params.id, items]);

  const handleSave = useCallback(() => {
    const editedItem: Hotel = new Hotel(
      item?.id ?? "",
      hotelData.name,
      hotelData.imageURL,
      hotelData.price,
      hotelData.description,
      hotelData.added.toString(),
      hotelData.available
    );
    console.log(hotelData);

    saveItem && saveItem(editedItem).then(() => history.goBack());
  }, [item, saveItem, hotelData, history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{item?.name ?? "Add new hotel"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <form className="ion-padding">
          <IonItem>
            <IonLabel position="floating">Name</IonLabel>
            <IonInput
              value={hotelData.name}
              onIonChange={(e) =>
                setHotelData({ ...hotelData, name: e.detail.value || "" })
              }
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Description</IonLabel>
            <IonInput
              value={hotelData.description}
              onIonChange={(e) =>
                setHotelData({
                  ...hotelData,
                  description: e.detail.value || "",
                })
              }
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Price</IonLabel>
            <IonInput
              value={hotelData.price}
              type={"number"}
              onIonChange={(e) =>
                setHotelData({
                  ...hotelData,
                  price: parseFloat(e.detail.value || ""),
                })
              }
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Image URL</IonLabel>
            <IonTextarea
              rows={5}
              style={{ paddingBottom: "20px" }}
              value={hotelData.imageURL}
              onIonChange={(e) =>
                setHotelData({
                  ...hotelData,
                  imageURL: e.detail.value || "",
                })
              }
            />
          </IonItem>
          <IonItem>
            <IonCheckbox
              value={hotelData.available}
              onIonChange={(e) => {
                setHotelData({
                  ...hotelData,
                  available: e.detail.checked,
                });
              }}
              slot="start"
            ></IonCheckbox>
            <IonLabel>Hotel available</IonLabel>
          </IonItem>
          <IonItem>
            <IonImg src={hotelData.imageURL} alt="No image" />
          </IonItem>
          <IonButton
            onClick={handleSave}
            className="ion-margin-top"
            type="submit"
            expand="block"
          >
            {item ? "Edit" : "Save"}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default HotelDetails;

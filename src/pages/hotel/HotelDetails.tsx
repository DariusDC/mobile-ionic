import {
  createAnimation,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { add, map } from "ionicons/icons";
import { number } from "prop-types";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import MyMap, { MyPosition } from "../../components/MyMap";
import { usePhotos } from "../../hooks/usePhotos";
import { Hotel } from "../../models/Hotel";
import { HotelItemsContext } from "../../providers/HotelItemsProvider";
import { defineCustomElements } from "@ionic/pwa-elements/loader"

interface Props
  extends RouteComponentProps<{
    id?: string;
  }> { }

interface HotelData {
  description: string;
  imageURL: string;
  price: number;
  name: string;
  added: Date;
  available: boolean;
  lng?: number;
  lat?: number;
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
  const [hotelImage, setHotelImage] = useState<string>("");
  const [showMap, setShowMap] = useState<boolean>(false);
  const [presentAlert] = useIonAlert()


  const { photos, takePhoto, deletePhoto } = usePhotos();

  useEffect(() => {
    const routeId = match.params.id || "";
    const item = items?.find((it) => it._id === routeId);

    console.log(routeId);

    setItem(item);
    if (item) {
      setHotelData({
        description: item.desc,
        imageURL: item.imageURL,
        price: item.price,
        name: item.name,
        added: item.added,
        available: item.available,
        lat: item.lat,
        lng: item.lng,
      });
    }
  }, [match.params.id, items]);

  useEffect(() => {
    let photo = photos.filter(p => p.hotelId === item?._id);
    if (photo.length > 0) {
      setHotelImage(photo[0]?.webviewPath ?? "");
    }
  }, [photos]);

  useEffect(() => {
    console.log(item);

    if (item) {
      presentAlert({
        id: "my-alert",
        header: "Hotel details",
        subHeader: item.name,
        buttons: ["Ok"],
        enterAnimation: enterAnimationDone,
        leaveAnimation: leaveAnimationDone,
      })
    }
  },
    [item]);

  const enterAnimationDone = (baseEl: any) => {
    const root = document.getElementsByClassName("alert-wrapper")[0];

    const wrapperAnimation = createAnimation()
      .addElement(root!)
      .keyframes([
        { offset: 0, opacity: "0", transform: "scale(0)" },
        { offset: 0.25, opacity: "0.99", transform: "scale(0.25)" },
        { offset: 0.5, opacity: "0.99", transform: "scale(0.5)" },
        { offset: 0.75, opacity: "0.99", transform: "scale(0.75)" },
        { offset: 1, opacity: "0.99", transform: "scale(1)" },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing("ease-out")
      .duration(500)
      .addAnimation([wrapperAnimation]);
  };

  const leaveAnimationDone = (baseEl: any) => {
    return enterAnimationDone(baseEl).direction("reverse");
  };


  const handleSave = useCallback(() => {
    const editedItem: Hotel = new Hotel(
      item?._id ?? "",
      hotelData.name,
      hotelData.imageURL,
      hotelData.price,
      hotelData.description,
      hotelData.added.toString(),
      hotelData.available,
      hotelData.lat,
      hotelData.lng,
    );

    saveItem && saveItem(editedItem).then(() => history.goBack());
  }, [item, saveItem, hotelData, history]);

  defineCustomElements(window)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{item?.name ?? "Add new hotel"}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => takePhoto(item?._id ?? "")}>
              Take photo
            </IonButton>
            <IonButton onClick={() => {
              setShowMap(!showMap)
            }}>
              {!showMap ? "Open maps" : "Close maps"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {!showMap && <IonContent fullscreen>
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
          {hotelData.lat &&
            <IonItem>
              <IonLabel>Positions: {hotelData.lat + " " + hotelData.lng}</IonLabel>
            </IonItem>
          }
          <IonItem>
            <IonImg src={hotelImage} alt="No image" />
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
      </IonContent>}
      {showMap &&
        <IonContent fullscreen>
          <MyMap
            onMapClick={(e) => {
              setHotelData({ ...hotelData, lat: e.latitude, lng: e.longitude })
            }} onMarkerClick={() => {

            }}
          />
          {(hotelData.lat) &&
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton onClick={() => setShowMap(false)}>
                <IonIcon icon={add} />
              </IonFabButton>
            </IonFab>
          }
        </IonContent>}
    </IonPage>
  );
};

export default HotelDetails;

import {
  createAnimation,
  CreateAnimation,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { useContext, useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
import HotelItem from "../../components/HotelItem/HotelItem";
import { Hotel } from "../../models/Hotel";
import { HotelItemsContext } from "../../providers/HotelItemsProvider";
import "./HotelList.css";
import { useHotels } from "./useHotels";
import { add } from "ionicons/icons";
import { AuthContext } from "../../providers/AuthProvider";
import { useNetwork } from "../../hooks/useNetwork";
import { wifi } from "ionicons/icons"
import MyMap from "../../components/MyMap";

const HotelList: React.FC<RouteComponentProps> = ({ history }) => {
  const { items, fetching, fetchingError, onServer, backOnNetwork, onNameChange, filteredItems, pushData, pageItems } = useContext(HotelItemsContext);
  const { logout } = useContext(AuthContext);
  const { networkStatus } = useNetwork()
  const [present] = useIonToast()
  const [name, setName] = useState("")
  const [onlyImages, setOnlyImages] = useState(false)
  const [isInfiniteDisabled, setIsInfiniteDisabled] = useState(false)
  const [showMap, setShowMap] = useState<boolean>(false);
  const fabAnimationRef = useRef<CreateAnimation>(null);
  const iconRef = useRef<CreateAnimation>(null);

  useEffect(fabAnimation, [fabAnimationRef.current, iconRef.current])

  useEffect(() => {
    backOnNetwork!()
  }, [networkStatus]);

  const loadData = (e: any) => {
    setTimeout(() => {
      pushData!();
      e.target.complete()
      if (items?.length === 1000) {
        setIsInfiniteDisabled(true);
      }
    }, 500);
  }

  function fabAnimation() {
    if (fabAnimationRef.current !== null) {
      fabAnimationRef.current.animation.play()
    }
    if (iconRef.current != null) {
      iconRef.current.animation.play()
    }
  }



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hotels</IonTitle>
          <IonButtons slot="end">
            <CreateAnimation ref={iconRef}
              duration={5000}
              fromTo={{
                property: 'transform',
                fromValue: 'rotate(0)',
                toValue: 'rotate(360deg)'
              }}
              easing="ease-out">
              <IonIcon icon={wifi} style={{ color: (networkStatus.connected && onServer) ? "#8DEB56" : "#ffffff" }} />
            </CreateAnimation>
            <IonButton onClick={logout}>
              Logout
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar><IonSearchbar placeholder="Search" onIonChange={(e) => {
          onNameChange!(e.target.value ?? "", onlyImages)
          setName(e.target.value ?? "")
        }} /></IonToolbar>
        <IonToolbar >
          <IonCheckbox onIonChange={e => {
            onNameChange!(name, e.target.checked);
            setOnlyImages(e.target.checked)
          }}></IonCheckbox>
          <IonLabel >Only with images</IonLabel>
        </IonToolbar>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => {
              setShowMap(!showMap)
            }}>
              {!showMap ? "Map" : "Close map"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {
        !showMap && <IonContent fullscreen>

          <IonLoading isOpen={fetching} message="Fetching the hotels" />
          <IonList>
            {(pageItems) &&
              (pageItems)?.map((hotel) => {
                return <HotelItem
                  key={hotel._id}
                  hotel={hotel}
                  id={hotel._id}
                  onTap={(id) => {
                    history.push(`/item/${id}`)
                  }}
                />
              }
              )}
          </IonList>
          <IonInfiniteScroll onIonInfinite={e => loadData(e)} threshold="25px" disabled={isInfiniteDisabled}>
            <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Loading more hotels..">
            </IonInfiniteScrollContent>
          </IonInfiniteScroll>
          <CreateAnimation ref={fabAnimationRef} duration={1000} fromTo={{
            property: "transform",
            fromValue: "scale(0)",
            toValue: "scale(1)"
          }} easing="ease-out">
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton onClick={() => history.push("/item")}>
                <IonIcon icon={add} />
              </IonFabButton>
            </IonFab>
          </CreateAnimation>
        </IonContent>
      }
      {
        showMap &&
        <IonContent fullscreen >
          <MyMap
            readOnly={true}
            markers={(items?.filter(e => e.lat && e.lng) as any).map((e: any) => {
              return {
                lat: e.lat,
                lng: e.lng,
                title: e.title,
              }
            })}
            onMapClick={(e) => {
            }} onMarkerClick={() => {

            }}
          />
        </IonContent>
      }

    </IonPage >
  );
};

export default HotelList;

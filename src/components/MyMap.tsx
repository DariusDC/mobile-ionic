import { GoogleMap } from '@capacitor/google-maps';
import { useIonToast } from '@ionic/react';
import { title } from 'process';
import { useEffect, useRef } from 'react';
import { mapsApiKey } from '../mapsApiKey';

interface MyMapProps {
  lat?: number;
  lng?: number;
  onMapClick: (e: any) => void,
  onMarkerClick: (e: any) => void,
  readOnly?: boolean,
  markers?: MyPosition[],
  initalMarker?: MyPosition | null,
}

export interface MyPosition {
  lng: number;
  lat: number;
  title: string;
}

const MyMap: React.FC<MyMapProps> = ({ lat, lng, onMapClick, onMarkerClick, readOnly, markers = [], initalMarker }) => {
  const mapRef = useRef<HTMLElement>(null);
  useEffect(myMapEffect, [mapRef.current])
  const markerIds = []

  const [present] = useIonToast()

  return (
    <div className="component-wrapper">
      <capacitor-google-map ref={mapRef} style={{
        display: 'block',
        width: 600,
        height: 800
      }}></capacitor-google-map>
    </div>
  );

  function myMapEffect() {
    let canceled = false;
    let googleMap: GoogleMap | null = null;
    let markerId: string | null = null;
    createMap();
    return () => {
      canceled = true;
      googleMap?.removeAllMapListeners();
    }

    async function createMap() {
      if (!mapRef.current) {
        return;
      }
      googleMap = await GoogleMap.create({
        id: 'my-cool-map',
        element: mapRef.current,
        apiKey: mapsApiKey,
        config: {
          center: { lat: 47 , lng: 23.5 },
          zoom: 8
        }
      })
      // const myLocationMarkerId = await googleMap.addMarker({ coordinate: { lat, lng }, title: 'My location' });

      markers.forEach(async (marker) => {
        const id = await googleMap?.addMarker({coordinate: {lat: marker.lat, lng: marker.lng}, title: marker.title ?? ""})
        markerIds.push(id)
      })

      if (initalMarker) {
        await googleMap?.addMarker({coordinate: {lat: initalMarker.lat, lng: initalMarker.lng}, title: "Hotel location"})
      }

      if (!readOnly) {
        await googleMap.setOnMapClickListener(async ({ latitude, longitude }) => {
          console.log(markerId);
          
           if (markerId) {
            await googleMap?.removeMarker(markerId ?? "");
            markerId = null;
           }
           markerId = await googleMap?.addMarker({ coordinate: { lat: latitude, lng: longitude }, title: 'Hotel location' }) ?? "";
          onMapClick({ latitude, longitude });
        });
      }
      await googleMap.setOnMarkerClickListener(({ markerId, latitude, longitude }) => {
        onMarkerClick({ markerId, latitude, longitude });
      });
    }
  }
}

export default MyMap;

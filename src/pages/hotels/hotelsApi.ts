import { Hotel } from "../../models/Hotel";
import axios from "axios";
import { Room } from "../../models/Room";
import { authConfig, getLogger } from "../../core";

const baseUrl = "http://localhost:3000/api/item";
const log = getLogger;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(
  promise: Promise<ResponseProps<T>>,
  fnName: string
): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then((res) => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch((err) => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const getItems: (token?: string) => Promise<Hotel[]> = token => {
  return withLogs(
    axios
      .get(`${baseUrl}/`, authConfig(token))
      .then((response) => {
        const { data } = response;
        const hotels: Hotel[] = [];
        data.forEach((h: any) => {
          hotels.push(  
            new Hotel(
              h._id.toString(),
              h.name,
              h.imageURL,
              h.price,
              h.description,
              h.added,
              h.available,
              h.lat,
              h.lng
            )
          );
          
        });
        return Promise.resolve({ data: hotels });
      })
      .catch((err) => {
        return Promise.reject(err);
      }),
    "get items"
  );
};

export const createItem: (token: string, hotel: Hotel) => Promise<Hotel> = (token, item) => {
  console.log(token);
  
  return withLogs(
    axios
      .post(`${baseUrl}/`, item.toJson(), authConfig(token))
      .then(({ data: h }) =>
        Promise.resolve({
          data: new Hotel(
            h.id,
            h.name,
            h.imageURL,
            h.price,
            h.description,
            h.added,
            h.available
          ),
        })
      )
      .catch((err) => Promise.reject(err)),
    "create item"
  );
};  

export const updateItem: (token: string, hotel: Hotel) => Promise<Hotel> = (token, item) => {
  console.log(item);

  return withLogs(
    axios
      .put(`${baseUrl}/${item._id}`, item.toJson(), authConfig(token))
      .then(({ data: h }) =>
        Promise.resolve({
          data: new Hotel(
            h.id,
            h.name,
            h.imageURL,
            h.price,
            h.description,
            h.added,
            h.available,
            h.lat,
            h.lng
          ),
        })
      )
      .catch((err) => Promise.reject(err)),
    "Update item"
  );
};

export const newWebSocket = (token: string, onMessage: (data: any) => void) => {
  const ws = new WebSocket(`ws://localhost:3000/`);
  ws.onopen = () => {
    log("web socket onopen");
    ws.send(JSON.stringify({type: "Authorization", payload: {token}}));
  };
  ws.onclose = () => {
    log("web socket onclose");
  };
  ws.onerror = (error) => {
    log("web socket onerror" + error);
  };
  ws.onmessage = (data) => {
    log("web socket onmessage");

    onMessage(JSON.parse(data.data as any));
  };
  return () => {
    ws.close();
  };
};

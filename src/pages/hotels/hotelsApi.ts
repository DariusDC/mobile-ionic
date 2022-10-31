import { Hotel } from "../../models/Hotel";
import axios from "axios";
import { Room } from "../../models/Room";
import { getLogger } from "../../core";

const baseUrl = "http://localhost:8080";
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

export const getItems: () => Promise<Hotel[]> = () => {
  return withLogs(
    axios
      .get(`${baseUrl}/hotels/`, config)
      .then((response) => {
        const { data } = response;
        console.log(data);

        const hotels: Hotel[] = [];
        data.forEach((h: any) => {
          hotels.push(
            new Hotel(
              h.id.toString(),
              h.name,
              h.imageURL,
              h.price,
              h.description,
              h.added,
              h.available
            )
          );
        });
        console.log(hotels);
        return Promise.resolve({ data: hotels });
      })
      .catch((err) => {
        return Promise.reject(err);
      }),
    "get items"
  );
};

export const createItem: (hotel: Hotel) => Promise<Hotel> = (item) => {
  return withLogs(
    axios
      .post(`${baseUrl}/hotels/`, item.toJson())
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

export const updateItem: (hotel: Hotel) => Promise<Hotel> = (item) => {
  console.log(item);

  return withLogs(
    axios
      .patch(`${baseUrl}/hotels/${item.id}`, item.toJson())
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
    "Update item"
  );
};

export const newWebSocket = (onMessage: (data: any) => void) => {
  const ws = new WebSocket(`ws://localhost:3000/`);
  ws.onopen = () => {
    log("web socket onopen");
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

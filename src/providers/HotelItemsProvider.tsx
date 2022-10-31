import React, {
  ReactPropTypes,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { getLogger } from "../core";
import { Hotel } from "../models/Hotel";
import {
  createItem,
  getItems,
  newWebSocket,
  updateItem,
} from "../pages/hotels/hotelsApi";
import PropTypes from "prop-types";

const log = getLogger("useItems");

type SaveItemFn = (item: Hotel) => Promise<any>;

export interface HotelsState {
  items?: Hotel[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveItem?: SaveItemFn;
}

export interface HotelsProps extends HotelsState {}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: HotelsState = {
  fetching: false,
  saving: false,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";
const SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED";
const SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED";
const SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED";

const reducer: (state: HotelsState, action: ActionProps) => HotelsState = (
  state,
  { type, payload }
) => {
  switch (type) {
    case FETCH_ITEMS_STARTED:
      return { ...state, fetching: true };
    case FETCH_ITEMS_SUCCEEDED:
      return { ...state, items: payload.items, fetching: false };
    case FETCH_ITEMS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    case SAVE_ITEM_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_ITEM_SUCCEEDED:
      console.log("paylod");
      console.log(payload);

      const items = [...(state.items || [])];
      const item = payload.item;
      const index = items.findIndex((it) => it.id == item.id);
      if (index == -1) {
        items.splice(0, 0, item);
      } else {
        items[index] = item;
      }
      return { ...state, items, saving: false };
    case SAVE_ITEM_FAILED:
      return { ...state, savingError: payload.error, saving: false };
    default:
      return state;
  }
};

export const HotelItemsContext = React.createContext<HotelsState>(initialState);

interface HotelItemsProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const HotelItemsProvider: React.FC<HotelItemsProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { fetching, saving, fetchingError, items, savingError } = state;
  useEffect(getItemsEffect, [dispatch]);
  useEffect(wsEffect, []);

  const saveItem = useCallback<SaveItemFn>(saveItemCallback, []);
  const value = {
    items,
    fetching,
    fetchingError,
    saving,
    savingError,
    saveItem,
  };
  return (
    <HotelItemsContext.Provider value={value}>
      {children}
    </HotelItemsContext.Provider>
  );

  function getItemsEffect() {
    let cancelled = false;
    fetchItems();
    return () => {
      cancelled = false;
    };

    async function fetchItems() {
      try {
        dispatch({ type: FETCH_ITEMS_STARTED });
        const items = await getItems();
        if (!cancelled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
        }
      } catch (error) {
        if (!cancelled) {
          dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
        }
      }
    }
  }

  async function saveItemCallback(hotel: Hotel) {
    try {
      log("Saving hotel");

      dispatch({ type: SAVE_ITEM_STARTED });
      const savedItem = await (hotel.id
        ? updateItem(hotel)
        : createItem(hotel));
      log("Succesfully saved");
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
    } catch (error) {
      log("Error saving  hotel");
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let cancelled = false;
    const closeWebSocket = newWebSocket((data) => {
      if (cancelled) {
        return;
      }
      dispatch({
        type: SAVE_ITEM_SUCCEEDED,
        payload: {
          item: new Hotel(
            data.id,
            data.name,
            data.imageURL,
            data.price,
            data.description,
            data.added,
            data.available
          ),
        },
      });
    });
    return () => {
      console.log("OFF ws");
      cancelled = true;
      closeWebSocket();
    };
  }
};

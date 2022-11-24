import React, {
  ReactPropTypes,
  useCallback,
  useContext,
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
import { AuthContext } from "./AuthProvider";
import { useNetwork } from "../hooks/useNetwork";
import { Preferences } from '@capacitor/preferences';
import { AppItems } from "../core/constants";

const log = getLogger("useItems");

type SaveItemFn = (item: Hotel) => Promise<any>;

type BackNetworkFn = () => void;

type OnNameChangeFn = (name: string | null, checkboxValue: boolean | null) => void;

type OnFilterChangeFn = (value: boolean) => void;

type PushDataFn = (data?: Hotel[]) => void;

export interface HotelsState {
  items?: Hotel[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveItem?: SaveItemFn;
  onServer: boolean;
  backOnNetwork?: BackNetworkFn;
  onNameChange?: OnNameChangeFn;
  filteredItems?: Hotel[];
  onFilterChange?: OnFilterChangeFn;
  pushData?: PushDataFn;
  pageItems?: Hotel[];
}

export interface HotelsProps extends HotelsState { }

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: HotelsState = {
  fetching: false,
  saving: false,
  onServer: true,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";
const SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED";
const SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED";
const SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED";
const SAVE_ITEM_OFFLINE = "SAVE_ITEM_OFFLINE";
const FETCH_ITEMS_SUCCEEDED_OFFLINE = "FETCH_ITEMS_SUCCEEDED_OFFLINE";
const ON_NAME_CHANGE = "ON_NAME_CHANGE";
const PUSH_ITEMS = "PUSH_ITEMS";

const reducer: (state: HotelsState, action: ActionProps) => HotelsState = (
  state,
  { type, payload }
) => {

  switch (type) {
    case FETCH_ITEMS_STARTED:
      return { ...state, fetching: false };
    case FETCH_ITEMS_SUCCEEDED:
      return { ...state, items: payload.items, fetching: false, onServer: true };
    case FETCH_ITEMS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    case SAVE_ITEM_STARTED:
      return { ...state, savingError: null, saving: false, onServer: true };
    case SAVE_ITEM_SUCCEEDED:

      const items = [...(state.items || [])];
      const item = payload.item;
      const index = items.findIndex((it) => it._id == item.id);
      if (index == -1) {
        items.splice(0, 0, item);
      } else {
        items[index] = item;
      }
      return { ...state, items, saving: false };
    case SAVE_ITEM_FAILED:
      return { ...state, savingError: payload.error, saving: false };
    case SAVE_ITEM_OFFLINE:
      return { ...state, items: payload.items, saving: false, onServer: false }
    case FETCH_ITEMS_SUCCEEDED_OFFLINE:
      return { ...state, items: payload.items, fetching: false, onServer: false }
    case ON_NAME_CHANGE:
      return {...state, pageItems: payload.items, filteredItems: payload.items }
      case PUSH_ITEMS:
        return {...state, pageItems: payload.items}
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
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { fetching, saving, fetchingError, items, savingError, onServer, filteredItems, pageItems } = state;
  const { networkStatus } = useNetwork()
  useEffect(getItemsEffect, [token,  networkStatus]);
  useEffect(wsEffect, []);

  const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token, items]);
  const backOnNetwork = useCallback<BackNetworkFn>(backOnNetworkCallback, [networkStatus, items]);
  const onNameChange = useCallback<OnNameChangeFn>(onNameChangeCallback, [items]);
  const pushData = useCallback<PushDataFn>(pushDataCallback, [items, filteredItems]);
  const value = {
    items,
    fetching,
    fetchingError,
    saving,
    savingError,
    saveItem,
    onServer,
    backOnNetwork,
    onNameChange,
    filteredItems,
    pushData, 
    pageItems,
  };
  return (
    <HotelItemsContext.Provider value={value}>
      {children}
    </HotelItemsContext.Provider>
  );

  function pushDataCallback(data?: Hotel[]) {
    const max = (pageItems?.length ?? 0) + 6;
    const min = max - 6;
    const newItems = [];
    const it = (data ?? filteredItems ?? items) ?? [];
    for (let i = min; i < max; i++) {
      if (it[i]) {
        newItems.push(it[i]);
      }
    }
    console.log(newItems);
    
    dispatch({ type: PUSH_ITEMS, payload: { items: [...pageItems ?? [], ...newItems] } })
  }

  function onNameChangeCallback(name: string | null, value: boolean | null) {
    let data = items?.filter(e => name != null ? e.name.includes(name) : true)
    if (value === true) {
      data = data?.filter(e => e.imageURL)
    } 
    dispatch({ type: ON_NAME_CHANGE, payload: {items: data} })
  }

  function getItemsEffect() {
    let cancelled = false;
    fetchItems();
    return () => {
      cancelled = false;
    };

    async function fetchItems() {
      try {
        dispatch({ type: FETCH_ITEMS_STARTED });

        const items = await getItems(token);
        
        await Preferences.set({ key: AppItems, value: JSON.stringify(items) })
        

        if (!cancelled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
          pushData(items)
        }
      } catch (error) {
        // dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
        const items = await Preferences.get({ key: AppItems });
        const hotels: Hotel[] = [];
        JSON.parse(items.value ?? "[]").forEach((h: any) => {
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
              h.lng,
              h.modified,
            )
          );

        });

        dispatch({ type: FETCH_ITEMS_SUCCEEDED_OFFLINE, payload: { items: hotels } })
        pushData(hotels)
      }
    }
  }

  async function saveItemCallback(hotel: Hotel) {
    try {
      dispatch({ type: SAVE_ITEM_STARTED });
      const savedItem = await (hotel._id
        ? updateItem(token, hotel)
        : createItem(token, hotel));
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
      await Preferences.set({
        key: AppItems,
        value: JSON.stringify([...items ?? [], savedItem]),
      });
    } catch (error) {

      hotel.modified = true;
      let itemsToSave = items ?? []
      let index = items?.findIndex((e) => e._id == hotel._id) ?? -1
      if (index == -1) {
        itemsToSave?.push(hotel);
      } else {
        itemsToSave[index] = hotel;
      }
      await Preferences.set({
        key: AppItems,
        value: JSON.stringify(itemsToSave),
      });
      dispatch({ type: SAVE_ITEM_OFFLINE, payload: { items: itemsToSave } })
    }
  }

  async function backOnNetworkCallback() {

    if (networkStatus.connected) {
      // First save the modified items
      const items = await Preferences.get({ key: AppItems });
      const hotels: Hotel[] = [];
      JSON.parse(items.value ?? "[]").forEach((h: any) => {
        hotels.push(
          new Hotel(
            h._id.toString(),
            h.name,
            h.imageURL,
            h.price,
            h.description,
            h.added,
            h.available,
            h.modified,
          )
        );

      });
      let changed = false;
      try {
        hotels?.forEach(async (item) => {
          if (item.modified) {
            await (item._id ? updateItem(token, item) : createItem(token, item))
            item.modified = false
            changed = true
          }
        })

        if (changed) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items: hotels } })
        }
      } catch {

        dispatch({ type: FETCH_ITEMS_SUCCEEDED_OFFLINE, payload: { items: hotels } })
      }
    }

  }

  function wsEffect() {
    let cancelled = false;
    const closeWebSocket = newWebSocket(token, (data) => {
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

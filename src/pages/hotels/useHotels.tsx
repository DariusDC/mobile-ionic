import { useEffect, useReducer, useState } from "react";
import { getLogger } from "../../core";
import { Hotel } from "../../models/Hotel";
import { getItems } from "./hotelsApi";

const log = getLogger("useItems");

export interface HotelsState {
  items?: Hotel[];
  fetching: boolean;
  error?: Error;
}

export interface HotelsProps extends HotelsState {}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: HotelsState = {
  items: undefined,
  fetching: false,
  error: undefined,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";

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
      return { ...state, error: payload.error, fetching: false };
    default:
      return state;
  }
};

export const useHotels: () => HotelsProps = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, fetching, error } = state;

  useEffect(getItemsEffect, [dispatch]);
  return {
    items,
    fetching,
    error,
  };

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
};

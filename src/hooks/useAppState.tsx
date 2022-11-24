import { useEffect, useState } from "react"
import { AppState } from "@capacitor/app"
import { Plugins } from "@capacitor/core"

const { App } = Plugins

const initialState = {
    isActive: true
}

export const useAppState = () => {
    const [appState, setAppState] = useState(initialState)
    useEffect(() => {
        const handler = App.addListener("appStateChange", handleAppStateChange);
        App.getState().then(handleAppStateChange)
        let cancelled = false;
        return () => {
            cancelled = true;
            handler.remove();
        }

        function handleAppStateChange(state: AppState) {
            if (!cancelled) {
                setAppState(state)
            }
        }
    }, [])

    return { appState }
}
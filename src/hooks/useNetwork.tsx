import { useEffect, useState } from 'react';
import { ConnectionStatus, Network } from '@capacitor/network';

const initialState = {
    connected: false,
    connectionType: 'unknown',
}

export const useNetwork = () => {
    const [networkStatus, setNetworkStatus] = useState(initialState)
    useEffect(() => {
        const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange);
        Network.getStatus().then(handleNetworkStatusChange);

        function handleNetworkStatusChange(status: ConnectionStatus) {
            setNetworkStatus(status);
        }
    }, [])
    return { networkStatus };
};

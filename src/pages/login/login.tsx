import { IonButton, IonContent, IonGrid, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import React, { useContext, useState } from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { AuthContext } from "../../providers/AuthProvider";

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const { username, password } = state;
    const handleLogin = () => {
        login?.(username, password);
    };
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/home' }} />
    }
    return <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Login</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonInput
                placeholder="Username"
                value={username}
                onIonChange={e => setState({
                    ...state,
                    username: e.detail.value || ''
                })} />
            <IonInput
                placeholder="Password"
                value={password}
                onIonChange={e => setState({
                    ...state,
                    password: e.detail.value || ''
                })} />
            <IonLoading isOpen={isAuthenticating} />
            {authError && (
                <div>{authError.message || 'Failed to authenticate'}</div>
            )}
            <IonButton onClick={handleLogin}>Login</IonButton>
        </IonContent>
    </IonPage>
}
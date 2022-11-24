import React, { useCallback, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { login as loginApi } from "../api/authApi"
import { AppToken } from "../core/constants";

type LoginFn = (username?: string, password?: string) => void;

type LogoutFn = () => void;

export interface AuthState {
    authError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    logout?: LogoutFn;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authError: null,
    pendingAuthentication: false,
    token: ""
}

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setstate] = useState<AuthState>(initialState);
    const { isAuthenticated, isAuthenticating, authError, pendingAuthentication, token } = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, []);

    useEffect(checkIfUserIsLogged, []);
    useEffect(authenticationEffect, [pendingAuthentication]);

    const value = { isAuthenticated, login, isAuthenticating, authError, token, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

    function loginCallback(username?: string, password?: string): void {
        setstate({
            ...state,
            pendingAuthentication: true, username, password
        })
    }

    function logoutCallback(): void {
        localStorage.removeItem(AppToken);
        setstate({
            ...state,
            pendingAuthentication: false,
            isAuthenticated: false,
            token: "",
            isAuthenticating: false,
        })
    }

    function checkIfUserIsLogged() {
        const token = localStorage.getItem(AppToken)
        if (token) {
            setstate({
                ...state, isAuthenticated: true,
                token, isAuthenticating: false,
                pendingAuthentication: false
            })
        }
    }

    function authenticationEffect() {
        let cancelled = false;
        authenticate();
        return () => {
            cancelled = true;
        }

        async function authenticate() {
            if (!pendingAuthentication) {
                return;
            }
            try {
                setstate({
                    ...state, isAuthenticating: true
                })
                const { username, password } = state;

                const data = await loginApi(username, password);

                localStorage.setItem(AppToken, data.token);

                setstate({
                    ...state,
                    token: data.token, isAuthenticated: true,
                    isAuthenticating: false,
                    pendingAuthentication: false
                })
            } catch (error) {
                if (cancelled) {
                    return
                }
                setstate({
                    ...state, authError: error as Error, pendingAuthentication: false, isAuthenticating: false
                })
            }
        }
    }
}
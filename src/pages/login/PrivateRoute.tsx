import PropTypes from "prop-types"
import React, { useContext } from "react"
import { Redirect, Route } from "react-router";
import { AuthContext, AuthState } from "../../providers/AuthProvider"

export interface PrivateRouteProps {
    component: React.FC<any>;
    path: string;
    exact?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
    const { isAuthenticated } = useContext<AuthState>(AuthContext);
    return (
        <Route  {...rest} render={props => {
            if (isAuthenticated) {
                // @ts-ignore
                return <Component {...props} />
            }
            return <Redirect to={{ pathname: "/login" }} />
        }} />
    )
}
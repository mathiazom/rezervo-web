"use client";

import { useContext, useEffect } from "react";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";

export default function AutoLogin() {
    const { logIn } = useContext<IAuthContext>(AuthContext);

    useEffect(() => {
        logIn();
    }, [logIn]);

    return null;
}

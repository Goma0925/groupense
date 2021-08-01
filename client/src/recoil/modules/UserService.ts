import axios, { AxiosResponse } from "axios";
import { log } from "console";
import { useCallback } from "react";
import { atom, useSetRecoilState } from "recoil";
import { User } from "../models";

export const loginState = atom<boolean>({
    key: "loginState",
    default: false,
});

export const userState = atom<User>({
    key: "userState",
    default: { name: "Unknown User", id: "-1" },
})

// Types for login operations
type UserAuthPayload = {
    username: string;
    password: string;
}
type LoginResponse = User & {
    access_token: string;
    token_type: string;
}

export const userService = {
    useFetchLoginState: ()=>{
        const setLoginState = useSetRecoilState(loginState);
        const fetchLoginState = useCallback(()=>{
            axios.get("http://127.0.0.1:8000/api/users/check-auth")
                .then((res: AxiosResponse)=>{
                    setLoginState(true);
                    console.log("Token auth:", res.data);
                }).catch((err)=>{
                    console.error("No valid token.\n", err.response.data);
                    setLoginState(false);
                })
            }, [loginState]);
        return fetchLoginState;
    },

    useLogin: ()=>{
        const setLoginState = useSetRecoilState(loginState);
        const setUserState = useSetRecoilState(userState);
        const login = useCallback(async (payload: UserAuthPayload)=>{            
            axios.post("http://127.0.0.1:8000/api/users/login", new URLSearchParams(payload))
                .then(async (res:AxiosResponse<LoginResponse>) => {
                    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
                    setUserState({
                        name: res.data.name,
                        id: res.data.id,
                    })
                    setLoginState(true);
                }).catch((err)=>{
                    console.error("Login failed\n", err.response.data);
                    setLoginState(false);
                })
        }, [setLoginState])
        return login;
    },

    useSignupToLogin: ()=>{
        // Sign up a user and login successively.
        const login = userService.useLogin();
        const signup = async (payload: UserAuthPayload)=>{
            console.log("Payload", payload);
            axios.post("http://127.0.0.1:8000/api/users/signup", payload)
                .then(async (res:AxiosResponse<User>) => {
                    login(payload);
                }).catch((err)=>{
                    console.error("Signup failed\n", err.response.data);
                    throw err;
            })
        }
        return signup;
    }
}


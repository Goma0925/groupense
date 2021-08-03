import axios, { AxiosError, AxiosResponse } from "axios";
import { useCallback } from "react";
import { atom, useRecoilCallback, useSetRecoilState } from "recoil";
import CONSTS from "../../const";
import { User } from "../models";

const states = {
    isLoggedIn: atom<boolean>({
        key: "loginState",
        default: false,
    }),
    
    user: atom<User>({
        key: "userState",
        default: { name: "Unknown User", id: "-1" },
    })
}

// Types for login operations
type UserAuthPayload = {
    username: string;
    password: string;
}
type LoginResponse = User & {
    id: string,
    name: string
    access_token: string;
    token_type: string;
}

const hooks = {
    useLoginWithRefreshToken: ()=>{
        const loginWithRefreshToken = useRecoilCallback(
            ({set})=>()=>{
            return axios.get("/users/refresh-auth-token")
                .then((res: AxiosResponse<User>)=>{
                    set(states.isLoggedIn, true);
                    set(states.user, {
                        name: res.data.name,
                        id: res.data.id,
                    });
                }).catch((err)=>{
                    set(states.isLoggedIn, false);
                    throw err;
                })
            }, []);
        return loginWithRefreshToken;
    },

    useLogin: ()=>{
        const login = useRecoilCallback(
            ({set})=>
            async (payload: UserAuthPayload)=>{            
                return axios.post("/users/login", new URLSearchParams(payload))
                    .then(async (res:AxiosResponse<LoginResponse>) => {
                        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
                        set(
                            states.user,
                            {
                                name: res.data.name,
                                id: res.data.id,
                            }
                        )
                        set(states.isLoggedIn, true);
                    }).catch((err: AxiosError)=>{
                        set(states.isLoggedIn, false);
                        throw err;
                    })
        }, [])
        return login;
    },

    useLogout: ()=>{
        const logout = useCallback(()=>{
            axios.post("/users/logout")
                .then(()=>{
                    window.location.replace(CONSTS.APP_URL);
                })
                .catch((err)=>{throw err});
        }, []);
        return logout;
    },

    useSignupToLogin: ()=>{
        // Sign up a user and login successively.
        const login = hooks.useLogin();
        const signup = async (payload: UserAuthPayload)=>{
            return axios.post("/users/signup", payload)
                .then(async (res:AxiosResponse<User>) => {
                    login(payload);
                }).catch((err)=>{
                    throw err;
            })
        }
        return signup;
    }
}

export default {
    hooks:hooks,
    states:states,
}



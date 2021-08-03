import { useEffect, useState } from "react";
import { RecoilRoot,useRecoilState,useRecoilValue } from "recoil";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getByTitle, getByTitleAsJson } from "./utils/helpers";
import UserService from "../modules/UserService";
import CONSTS from "../../const";
import { User } from "../models";
import { act, render } from "@testing-library/react";
import dotenv from "dotenv";

let mockAPI: MockAdapter;

beforeAll(()=>{
    mockAPI = new MockAdapter(axios);
})

beforeEach(()=>{
    mockAPI.reset();
})

describe("UserService hook tests", ()=>{
    test(UserService.hooks.useLogin.name + " should call the login endpoint with username and password" + 
        " and store the user info returned from API. The returned access token should be set to the axios header.", 
        async()=>{
            const testUserId = "1";
            const testUser = {username: "TestUser", password: "Password"}
            const accessToken = "XXXXXXX";
            mockAPI.onPost(`/users/login`).reply(200, {
                "id": testUserId,
                "name": testUser.username,
                "access_token": accessToken,
                "token_type": "bearer",
                "refresh_token": "Sent in HTTPOnly cookie"
            });

            function TestComponent(){
                const isLoggedIn = useRecoilValue(UserService.states.isLoggedIn);
                const user = useRecoilValue(UserService.states.user);
                const login = UserService.hooks.useLogin();
                useEffect(()=>{
                    login(testUser);
                }, []);
                return (<>
                    <div title="isLoggedIn">{JSON.stringify({value: isLoggedIn})}</div>
                    <div title="user">{JSON.stringify(user)}</div>
                </>)
            }

            // Check user data is properly loaded.
            const user = await getByTitleAsJson<User>("user", <RecoilRoot><TestComponent/></RecoilRoot>);
            expect(user).toEqual({name: testUser.username, id: testUserId});
            // Check isLoggedin is turned to true.
            const isLoggedIn = await getByTitleAsJson<{[value: string]: boolean}>("isLoggedIn", <RecoilRoot><TestComponent/></RecoilRoot>);
            expect(isLoggedIn.value).toBe(true);
            // Check if axios header has the access token. 
            expect(axios.defaults.headers.common["Authorization"]).toEqual("Bearer "+accessToken);
        }
    );

    test(UserService.hooks.useLogout.name + " should call the logout endpoint and get a success response. "+ 
        "Then it should reload the page and jump to the root path. (Also, serverside destroys the refresh token cookie upon the API call)", 
        async()=>{
            mockAPI.onPost(`/users/logout`).reply(200);
            function TestComponent(){
                const logout = UserService.hooks.useLogout();
                useEffect(()=>{
                    logout();
                }, []);
                return <></>
            }
            // Check if window.location.replace function is called, which redirects to the root path.
            const mockReplace = jest.fn();
            Object.defineProperty(window, "location", {
                value: {
                    replace: mockReplace
                },
                writable: true // Allow the ReadOnly function to be overwritten.
            })
            await act(async ()=>{render(<RecoilRoot><TestComponent/></RecoilRoot>)});
            expect(window.location.replace).toHaveBeenCalledWith(CONSTS.APP_URL);
        }
    );

    test(UserService.hooks.useLoginWithRefreshToken.name + "should call the refresh auth token endpoint to retrieve the auth token using" + 
        "'refresh_token' cookie and store the user info returned from API. The returned access token should be set to the axios header.",
        async()=>{
            const accessToken = "XXXXXXXXX";
            const expectedUser = {"id": "1", "name": "Test user",}
            mockAPI.onGet("/users/refresh-auth-token").reply(200, {
                    ...expectedUser,
                    "access_token": accessToken,
                    "token_type": "bearer",
                    "refresh_token": "Sent in HTTPOnly cookie"
                }
            )
            function TestComponent(){
                const isLoggedIn = useRecoilValue(UserService.states.isLoggedIn);
                const user = useRecoilValue(UserService.states.user);
                const loginWithRefreshToken = UserService.hooks.useLoginWithRefreshToken();
                useEffect(()=>{
                    loginWithRefreshToken();
                }, []);
                return (
                    <>
                        <div title="isLoggedIn">{JSON.stringify({value: isLoggedIn})}</div>
                        <div title="user">{JSON.stringify(user)}</div>
                    </>
                )
            }
            const isLoggedIn = await getByTitleAsJson<{[value: string]: boolean}>("isLoggedIn", <RecoilRoot><TestComponent/></RecoilRoot>);
            const user = await getByTitleAsJson<User>("user", <RecoilRoot><TestComponent/></RecoilRoot>);
            expect(isLoggedIn.value).toBe(true);
            expect(user).toEqual(expectedUser);
        }
    )

    test(UserService.hooks.useSignupToLogin.name + "should call the signup endpoint with username and password. On success response, it should"+
        "store the user info and set the access token to the axios header.",
        async()=>{
            const testUserPayload = {username: "TestUser", password: "Password"};
            const testUserId = "1";
            const accessToken = "XXXXXXX";
            mockAPI.onPost(`/users/login`).reply(200, {
                "id": testUserId,
                "name": testUserPayload.username,
                "access_token": accessToken,
                "token_type": "bearer",
                "refresh_token": "Sent in HTTPOnly cookie"
            });
            mockAPI.onPost(`/users/signup`).reply(200, {
                "id": testUserId,
                "name": testUserPayload.username,
            });

            function TestComponent(){
                const isLoggedIn = useRecoilValue(UserService.states.isLoggedIn);
                const user = useRecoilValue(UserService.states.user);
                const signupToLogin = UserService.hooks.useSignupToLogin();
                useEffect(()=>{
                    signupToLogin(testUserPayload);
                }, []);
                return (<>
                    <div title="isLoggedIn">{JSON.stringify({value: isLoggedIn})}</div>
                    <div title="user">{JSON.stringify(user)}</div>
                </>)
            }

            // Check user data is properly loaded.
            const user = await getByTitleAsJson<User>("user", <RecoilRoot><TestComponent/></RecoilRoot>);
            expect(user).toEqual({name: testUserPayload.username, id: testUserId});
            // Check isLoggedin is turned to true.
            const isLoggedIn = await getByTitleAsJson<{[value: string]: boolean}>("isLoggedIn", <RecoilRoot><TestComponent/></RecoilRoot>);
            expect(isLoggedIn.value).toBe(true);
            // Check if axios header has the access token. 
            expect(axios.defaults.headers.common["Authorization"]).toEqual("Bearer "+accessToken);
        }
    )

    test.todo("API calls with error connections should be added to error queue.");
}) 
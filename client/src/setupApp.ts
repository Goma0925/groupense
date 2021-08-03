// Script to set up the client-side application
import axios from "axios";
import CONSTS from "./const";

export default function setup(){
    // Check if all the constants are defined or correctly loaded from .env file.
    let constant : keyof typeof CONSTS;
    for (constant in CONSTS) {
        if (CONSTS[constant] == "") {
            throw new Error(`Missing application constant: ${constant}`);
        }
    }
    axios.defaults.baseURL = CONSTS.API_URL;
}

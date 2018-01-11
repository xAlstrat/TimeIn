import React, { Component } from 'react';
import App from "./App";
import { CookiesProvider } from 'react-cookie';

export class Root extends Component{
    render(){
        return (
            <CookiesProvider>
                <App />
            </CookiesProvider>
        );
    }
}
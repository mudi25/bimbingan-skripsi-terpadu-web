import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: "AIzaSyBvFgGMo14qtib-vU_c2Z8OZ_Up1mqXkr4",
    authDomain: "bimbimngan-skripsi-terpadu.firebaseapp.com",
    projectId: "bimbimngan-skripsi-terpadu",
    storageBucket: "bimbimngan-skripsi-terpadu.appspot.com",
    messagingSenderId: "991841552940",
    appId: "1:991841552940:web:747a7245c4afe12ce61f89",
    measurementId: "G-WWKQ8QGJ9F",
  });
}

ReactDOM.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import DashboardPage from "./page/dashboard";
import LoginPage from "./page/login";
function App() {
  const auth = firebase.apps[0].auth();
  const [user, loading, error] = useAuthState(auth);
  if (loading) {
    return <LinearProgress />;
  }
  if (error) {
    return <p>{error.message}</p>;
  }
  if (user) {
    return <DashboardPage />;
  }
  return <LoginPage />;
}

export default App;

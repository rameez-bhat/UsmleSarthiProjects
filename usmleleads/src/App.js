import firestoreQueries from './firestore';
import React, { Suspense, useEffect,useState } from 'react'
import { BrowserRouter, Route, Routes,Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { onAuthStateChanged } from "firebase/auth";
import { AuthProvider } from './authuser/AuthContext';
import { signOut,createUserWithEmailAndPassword } from "firebase/auth";
import auth from "./apis/auth";
import { LoadingProvider } from './layout/LoadingContext';
import SpinnerOverlay from './layout/SpinnerOverlay';
// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
let ActualUser;
let AuthUser;
const DatabaseName="LeadTracker";
// Pages

const App = () => {
 const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [AuthUserR, setAuthUserR] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    //firestoreQueries.updateOrCreateByField("website1", "users", "email", "test@example.com", data);

     const unsubscribe = onAuthStateChanged  (auth, async (user) => {

      if (user) {
      AuthUser=user;
      setAuthUserR(AuthUser)
      let data={"name":"Shafi","role":"SuperAdmin","email":"bhat@gmail.com","phone":"8082166214","uid":user.uid};
     //const res=await firestoreQueries.handleUpdate("DDOSDATA", "users",user.uid, data);
    const res=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users",20,"uid","==",user.uid);
     if(res)
     {
      ActualUser=res[0];
     }
      	setIsUserLoggedIn(true);
      	  setLoading(false);
      	 //const SelectedUser =  await firestoreQueries.FetchDataFromCollection("users", 20, "__name__", "==", user['uid'], 0);
      	 //console.log("SelectedUser--->",SelectedUser)
    	/*if(SelectedUser.length)
      	{
      		if(SelectedUser?.[0]?.['Role']==="Admin" || SelectedUser?.[0]?.['Role']==="Gold")
      		{
      			setIsUserLoggedIn(true);
      		}

      	}*/

      } else {
        setIsUserLoggedIn(false);
         setLoading(false);
      }
     // setLoading(false); // Authentication check complete
    });
    if (theme) {
      setColorMode(theme)
    }
    else
    {
    	setColorMode(storedTheme)
    }
return () => unsubscribe();

  }, []) // eslint-disable-line react-hooks/exhaustive-deps





if (loading) {
    // Show a spinner or loading indicator while checking auth state
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }
  else
  {
    return (
  <LoadingProvider>
<SpinnerOverlay />
 <BrowserRouter>
<DefaultLayout  isUserLoggedIn={isUserLoggedIn} ActualUser={ActualUser} AuthUser={AuthUserR} />
    </BrowserRouter>
</LoadingProvider>
  );
  }
  
}

export default App



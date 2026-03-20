import { FetchDataFromCollection ,SelectWithComplexConditionsJoin,updateTimestampsInCollection,updateTimestampsAndAddCreatedAt} from './firestore';
import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import { LoadingProvider } from './layout/LoadingContext';
import SpinnerOverlay from './layout/SpinnerOverlay';
import theme2 from './components/css/theme';
import auth from './apis/auth';

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

let ActualUser;

const App = () => {
  console.log('App rendering');
  const { setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);
  const [state, setState] = useState({
    isLoggedIn: false,
    authUser: null,
    loading: true,
  });
  const [isAppReady, setAppReady] = useState(false); // New "ready" state

  useEffect(() => {
    console.log('useEffect executing');
    //updateTimestampsAndAddCreatedAt("Users")
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
       // const res = await FetchDataFromCollection('UsersRoles', 20, '__name__', '==', user.uid, 0);
        const  conditionsArrayNote =
    		[
  				[
    				{ name: "__name__", condition: "==", value: user.uid },
  				]
			];
        const NoteSectionDataObj =await SelectWithComplexConditionsJoin("UsersRoles",conditionsArrayNote,null,null,null,"Users","uid","uid");
        const res=NoteSectionDataObj['data'];

        if (res?.length) {
          res[0].role = res[0].Role;
          ActualUser = res[0];
          setState({ isLoggedIn: true, authUser: user, loading: false });
        }
      } else {
        setState({ isLoggedIn: false, authUser: null, loading: false });
      }
      setAppReady(true); // Mark app as ready after fetching completes
    });

    if (theme) {
      setColorMode(theme);
    } else {
      setColorMode(storedTheme);
    }

    return () => unsubscribe();
  }, [setColorMode, storedTheme]);

  if (!isAppReady) {
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }

  return (
    <Suspense fallback={<CSpinner color="primary" variant="grow" />}>
      <LoadingProvider theme={theme2}>
        <SpinnerOverlay />
        <BrowserRouter>
          <DefaultLayout
            isUserLoggedIn={state.isLoggedIn}
            ActualUser={ActualUser}
            AuthUser={state.authUser}
          />
        </BrowserRouter>
      </LoadingProvider>
    </Suspense>
  );
};

export default App;



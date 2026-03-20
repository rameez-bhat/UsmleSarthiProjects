import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { signOut} from "firebase/auth";
import auth from "../apis/auth";
import { useNavigate } from 'react-router-dom';
const DefaultLayout = ({isUserLoggedIn,ActualUser,AuthUser}) => {
  const navigate = useNavigate();
const Logout = async () =>{

  try {
      await signOut(auth);
      console.log('Sign-out successful');
      navigate('/login');
      // Redirect or perform other actions upon successful sign-out
    } catch (error) {
      console.error('Sign-out error:', error.message);
      // Handle sign-out error, if any
    }
}
  return (
    <div>
    	 {isUserLoggedIn ? (
			<>
			<AppSidebar Logout={Logout} isUserLoggedIn={isUserLoggedIn} ActualUser={ActualUser} AuthUser={AuthUser} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader Logout={Logout} isUserLoggedIn={isUserLoggedIn} ActualUser={ActualUser} AuthUser={AuthUser}/>
        <div className="body flex-grow-1">
          <AppContent Logout={Logout} isUserLoggedIn={isUserLoggedIn} ActualUser={ActualUser} AuthUser={AuthUser}  />
        </div>
        <AppFooter Logout={Logout} isUserLoggedIn={isUserLoggedIn} ActualUser={ActualUser} AuthUser={AuthUser} />
      </div>
      </>

          ):(
          <>
      <div className="wrapper d-flex flex-column min-vh-100">
        <div className="body flex-grow-1">
          <AppContent Logout={Logout} isUserLoggedIn={isUserLoggedIn} ActualUser={ActualUser} AuthUser={AuthUser}  />
        </div>
        <AppFooter />
      </div>
      </>
          ) }

    </div>
  )
}
export default DefaultLayout

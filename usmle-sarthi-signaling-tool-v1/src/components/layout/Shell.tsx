function Shell({
  children,
  user,
  onLogout
}: any) {

  return (
    <>

      <header>

        <div>

          <b>
            USMLE SARTHI
          </b>

          <span>
            Signaling Tool · v1.0
          </span>

        </div>


        {user && (

          <div className="headerRight">

            <span>
              {user.email}
            </span>

            <button

              className="ghost"

              onClick={
                onLogout
              }

            >

              Sign out

            </button>

          </div>

        )}

      </header>


      <main>
        {children}
      </main>

    </>
  );

}


/*
 * Dashboard
 */


export default Shell;

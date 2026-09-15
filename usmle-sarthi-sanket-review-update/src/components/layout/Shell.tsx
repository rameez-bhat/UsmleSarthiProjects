export default function Shell({ children, user, onLogout }: any) {
  return <>
    <header>
      <div><b>Sarthi SANKET</b><span>Program Signaling Tool</span></div>
      {user && <div className="headerRight"><span>{user.email}</span><button className="ghost" onClick={onLogout}>Sign out</button></div>}
    </header>
    <main>{children}</main>
  </>;
}

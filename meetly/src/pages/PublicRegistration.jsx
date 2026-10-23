import React from "react";
import { RegistrationPanel } from "../components/RegistrationPanel";
export function PublicRegistration() {
  const id = location.pathname.split("/")[2],
    token = new URLSearchParams(location.search).get("token") || "";
  return (
    <>
      <header className="public-top">
        <a className="brand" href="/">
          meetly.
        </a>
      </header>
      <RegistrationPanel id={id} token={token} />
    </>
  );
}

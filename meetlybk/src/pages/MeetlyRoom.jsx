import React, { useState, useEffect } from "react";
import { api } from "../firebase";
export function MeetlyRoom({ id }) {
  const [room, setRoom] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api("Room", {
      id,
    })
      .then((data) => {
        if (active) setRoom(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (error)
    return (
      <div className="auth-card" role="alert">
        {error}
      </div>
    );
  if (!room)
    return (
      <div className="empty" role="status">
        Opening your meeting room…
      </div>
    );
  return (
    <main className="meetly-room">
      <h1>{room.title}</h1>
      <p>Hosted by {room.hostName} · Video powered by Jitsi</p>
      <iframe
        title="Meetly video meeting"
        src={room.url}
        allow="camera; microphone; display-capture; fullscreen; autoplay"
        allowFullScreen
      />
      <p>
        <a href={room.url} target="_blank" rel="noreferrer">
          Open video in a separate tab
        </a>
      </p>
    </main>
  );
}

import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { ArrowRight } from "lucide-react";
export function AuthPanel({ notify, signInOnly = false }) {
  const [signup, setSignup] = useState(
      !signInOnly && new URLSearchParams(location.search).has("signup"),
    ),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(true);
    try {
      if (signup) {
        const r = await createUserWithEmailAndPassword(
          auth,
          d.get("email"),
          d.get("password"),
        );
        await sendEmailVerification(r.user);
        notify(
          "Verification email sent. Verify your email. An administrator must assign an authorized role in UsersRoles before you can host.",
        );
      } else
        await signInWithEmailAndPassword(
          auth,
          d.get("email"),
          d.get("password"),
        );
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-card">
      <span className="eyebrow">YOUR TIME STARTS HERE</span>
      <h1>{signup ? "Make room for good meetings." : "Welcome back."}</h1>
      <p>
        {signup
          ? "Create an account. An existing authorized role is required before you can host."
          : signInOnly
            ? "Sign in with your existing USMLESarthi account to book this meeting."
            : "Sign in to your scheduling workspace."}
      </p>
      <form onSubmit={submit}>
        <label>
          Email address
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete={signup ? "new-password" : "current-password"}
          />
        </label>
        <button className="primary full" disabled={busy}>
          {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          <ArrowRight size={17} />
        </button>
      </form>
      {!signInOnly && (
        <button className="text-button" onClick={() => setSignup(!signup)}>
          {signup
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      )}
      <button
        className="text-button"
        onClick={async () => {
          const email = document.querySelector("input[name=email]")?.value;
          if (!email) {
            notify("Enter your email address above first.");
            return;
          }
          try {
            await sendPasswordResetEmail(auth, email);
            notify(
              "If an account exists, a password reset email will be sent.",
            );
          } catch (e) {
            notify(e.message);
          }
        }}
      >
        Forgot password?
      </button>
    </div>
  );
}

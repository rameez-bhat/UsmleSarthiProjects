import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Shell from '../../components/layout/Shell';

function Login() {

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [msg, setMsg] =
    useState('');

  const [loggingIn, setLoggingIn] =
    useState(false);


  const login =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();


      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      if (!cleanEmail) {

        setMsg(
          'Please enter your email address.'
        );

        return;
      }


      if (!password) {

        setMsg(
          'Please enter your password.'
        );

        return;
      }


      setMsg('');

      setLoggingIn(true);


      try {

        await signInWithEmailAndPassword(

          auth,

          cleanEmail,

          password

        );


      } catch (e: any) {

        console.error(
          'Login error:',
          e
        );


        switch (
          e.code
        ) {

          case 'auth/invalid-email':

            setMsg(
              'Please enter a valid email address.'
            );

            break;


          case 'auth/invalid-credential':

            setMsg(
              'Invalid email or password.'
            );

            break;


          case 'auth/user-disabled':

            setMsg(
              'This account has been disabled.'
            );

            break;


          case 'auth/too-many-requests':

            setMsg(
              'Too many failed login attempts. Please try again later.'
            );

            break;


          case 'auth/network-request-failed':

            setMsg(
              'Network error. Please check your internet connection.'
            );

            break;


          case 'auth/operation-not-allowed':

            setMsg(
              'Email/password login is not enabled in Firebase.'
            );

            break;


          default:

            setMsg(
              e?.message ||
              'Unable to sign in.'
            );

        }

      } finally {

        setLoggingIn(false);

      }

    };


  return (

    <Shell>

      <div className="login card">

        <div className="eyebrow">
          USMLE SARTHI
        </div>


        <h1>
          Program Signaling Tool
        </h1>


        <p className="muted">
          Sign in using your existing Sarthi account.
        </p>


        <form
          onSubmit={login}
        >

          <label>
            Email
          </label>


          <input

            type="email"

            value={email}

            onChange={
              e =>
                setEmail(
                  e.target.value
                )
            }

            placeholder="you@example.com"

            autoComplete="email"

            disabled={
              loggingIn
            }

          />


          <label>
            Password
          </label>


          <input

            type="password"

            value={password}

            onChange={
              e =>
                setPassword(
                  e.target.value
                )
            }

            placeholder="Enter your password"

            autoComplete="current-password"

            disabled={
              loggingIn
            }

          />


          <button

            type="submit"

            disabled={
              loggingIn
            }

          >

            {
              loggingIn
                ? 'Signing in...'
                : 'Sign In'
            }

          </button>

        </form>


        {msg && (

          <div className="notice danger">
            {msg}
          </div>

        )}

      </div>

    </Shell>

  );

}


/*
 * Shell
 */


export default Login;

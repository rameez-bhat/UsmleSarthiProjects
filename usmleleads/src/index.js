import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
console.log('VITE ENV:', import.meta.env);
console.log('API KEY:', import.meta.env.VITE_FIREBASE_API_KEY);
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)

import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import SynapseApp from './components/SynapseApp'
import { BrowserRouter as Router, Route, IndexRoute } from 'react-router-dom';
import Login from './components/Login.js'
import ChatLobby from './components/ChatLobby.js'
import Conversation from './components/Conversation.js'
import LandingPage from './components/LandingPage.js';

import store from './store';

window.onload = function(){
  render(
      <Provider store={store}>
        <Router>
          <SynapseApp>
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/lobby" component={ChatLobby} />
            <Route path="/conversation" component={Conversation} />
          </SynapseApp>
        </Router>
      </Provider>,
      document.getElementById('app')
    );
}
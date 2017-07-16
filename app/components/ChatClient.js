/* **************************************************************
 *                  Synapse - Desktop Client
 * @author Marco Fernandez Pranno <mfernandezpranno@gmail.com>
 * @licence MIT
 * @link https://github.com/SynapseNetwork/Synapse-Desktop
 * @version 1.0
 * ************************************************************** */

'use babel';

import React     from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  addMessageToChat,
  sendAcceptChat,
  receivedAcceptChat
} from '../actions/conversationsActions';

import {
  updateUserLists,
  connectChat,
  generateKeys,
  sendKeys,
  storeUserKeys
} from '../actions/chatActions';

import {
  initChat,
  updateUserStatus
} from '../actions/chatActions';

import Contacts from './Contacts'
import Chat from './Chat'

class ChatClient extends React.Component {

  constructor(props){
    super(props);
    this.listenToEvents = this.listenToEvents.bind(this);
  }

  componentDidMount() {
    if(!this.props.socket) {
      this.props.connectChat();
    }
  }

  componentDidUpdate(prevProps){
    if (!prevProps.socket && this.props.socket) {
      this.listenToEvents();
    }
  }

  listenToEvents() {
    const { socket, user, receiver } = this.props;

    socket.on('init-connection-msg', (data) => {
      const { allUsers, pendingMessages, user, keysReqAmount } = data;
      this.props.updateUserLists(allUsers);
      pendingMessages.forEach(message => {
        this.props.addMessageToChat(message, message.emitterId);
      });
      this.props.initChat(user, socket, keysReqAmount, this.props.signal, socket);
    });

    socket.on('init-chat', (data) => {
      this.props.sendAcceptChat(receiver._id);
      socket.emit('accept-chat', {
        receiverId: receiver._id,
        emitterId: user._id
      })
    });

    socket.on('accept-chat', (data) => {
      this.props.receivedAcceptChat(user._id);
    });

    socket.on('chat-msg', (data) => {
      const { message } = data;
      if (message.emitterId != this.props.user._id) {
        this.props.addMessageToChat(message, message.emitterId);
      }
    });

    socket.on('user-connected', (user) => {
      this.props.updateUserStatus(user, 'user-connected');
    });

    socket.on('user-disconnected', (user) => {
      this.props.updateUserStatus(user, 'user-disconnected');
    });

    socket.on('request-keys', amount => {
      this.props.sendKeys(this.props.signal, amount);
    });

    socket.on('receive-keys', data => {
      this.props.storeUserKeys(data.id, data.keys);
    });
  }

  render(){
    const { match } = this.props;
    return (
      <div>
        <Route path={match.url + '/contacts'} component={Contacts} />
        <Route path={match.url + '/chat/:userId'} component={Chat} />
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    updateUserLists,
    initChat,
    connectChat,
    sendAcceptChat,
    receivedAcceptChat,
    addMessageToChat,
    updateUserStatus,
    generateKeys,
    sendKeys,
    storeUserKeys
  }, dispatch);
};

const mapStateToProps = (state, ownProps) => {
  console.log('State: ', state);
  const receiverId = ownProps.match.params.userId;
  const receiver = receiverId ? allUsers.find((user) => user._id === receiverId) : null;
  const {
    onlineUsers,
    offlineUsers,
    socket,
    user,
    signal
  } = state.chat;

  return {
    onlineUsers,
    offlineUsers,
    user,
    receiver,
    socket,
    signal
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatClient);

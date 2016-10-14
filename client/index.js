import React from 'react'
import Relay from 'react-relay'
import DOM from 'react-dom'
import App from './components/App.jsx'

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer('http://localhost:3001/graphql', {
    credentials: 'cors',
  })
);

const viewerQuery = {
  queries: {
    Viewer: () => Relay.QL`query {Viewer}`
  },
  params: {
    isNotActuallyNeededButStillRequiredToExist: true
  },
  name: 'ViewerQuery'
};

DOM.render(
  <Relay.RootContainer Component={App}
                       route={viewerQuery}
                       renderLoading={() => <div className="loader"/>}
                       renderFailure={(error) => <pre>Error: {error.stack}</pre>}/>,
  document.getElementById('app'));

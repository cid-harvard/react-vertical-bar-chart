import React from 'react';
import BostonAracaju6Digit from './components/BostonAracaju6Digit';
import {
  Route,
  Switch,
  HashRouter,
} from 'react-router-dom';

const App = () => {

  return (
    <HashRouter>
      <Switch>
        <Route component={BostonAracaju6Digit} />
      </Switch>
    </HashRouter>
  )
}

export default App;

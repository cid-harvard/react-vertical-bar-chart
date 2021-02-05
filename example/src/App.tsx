import React from 'react';
import Boston6DigitRCA from './components/Boston6DigitRCA';
import {
  Route,
  Switch,
  HashRouter,
} from 'react-router-dom';

const App = () => {

  return (
    <HashRouter>
      <Switch>
        <Route component={Boston6DigitRCA} />
      </Switch>
    </HashRouter>
  )
}

export default App;

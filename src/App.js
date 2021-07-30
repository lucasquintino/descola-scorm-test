import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ScoWatch from './scenes/Watch'

const App = () => (
    <Switch>
      <Route path={'/'} component={ScoWatch}/>
    </Switch>

);

export default App;

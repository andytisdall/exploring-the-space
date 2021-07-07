import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';

import Playbar from './AudioHeader';
import Error from './Error';
import BandHeader from './BandHeader';
import history from '../history';

const App = () => {



    return (
        <div className="container">
            <Router history={history}>
                <Error />
                <Switch>        
                    <Route path="/:bandName" component={BandHeader} />            
                </Switch>
            </Router>
        </div>

    );
};

export default App;
import React from 'react';

import Playbar from './Playbar';
import Error from './Error';
import BandHeader from './BandHeader';
import BodyContainer from './BodyContainer';

const App = () => {


    return (
        <div className="container">
            <Error />
            <Playbar />
            <BandHeader />
            <BodyContainer />
        </div>

    );
};

export default App;
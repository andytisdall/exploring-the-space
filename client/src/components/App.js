import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';


import Error from './Error';
import BandHeader from './BandHeader';
import User from './User';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Home from './Home';
import { fetchUser, signOut } from '../actions';


import history from '../history';

const App = ({ signedIn, fetchUser }) => {

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div className="container">
            <Router history={history}>
                <Error />
                <Switch>    
                    <Route path="/" exact component={Home} />
                    <Route path="/signin" exact component={SignIn} />;
                    <Route path="/signup" exact component={SignUp} />;  
                    <Route path="/user" exact render={routeProps => {
                        if (!signedIn) {
                            history.push('/signin');
                            return null;
                        }
                        return <User {...routeProps} />;
                    }} />
                    <Route path="/:bandName" component={BandHeader} />
                </Switch>
            </Router>
        </div>

    );
};

const mapStateToProps = state => {
    return {
        signedIn: state.auth.isSignedIn,
        user: state.auth.user
    };
};

export default connect(mapStateToProps, { fetchUser, signOut })(App);
import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import Error from './Error';
import Header from './Header';
import User from './User';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Home from './Home';
import Help from './Help';
import Recorder from './Recorder';
import { fetchUser } from '../actions';

import history from '../history';

const App = ({ signedIn, fetchUser, error }) => {
  useEffect(() => {
    if (signedIn) {
      fetchUser();
    }
  }, []);

  const errClass = error ? 'error-margin' : '';

  return (
    <>
      <Error />
      <div className={`container ${errClass}`}>
        <Router history={history}>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/signin" exact component={SignIn} />;
            <Route path="/signup" exact component={SignUp} />;
            <Route
              path="/user"
              exact
              render={(routeProps) => {
                if (!signedIn) {
                  history.push('/signin');
                  return null;
                }
                return <User {...routeProps} />;
              }}
            />
            <Route path="/help" exact component={Help} />
            <Route path="/:bandName/record" exact component={Recorder} />
            <Route path="/:bandName" component={Header} />
          </Switch>
        </Router>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    signedIn: state.auth.isSignedIn,
    error: state.error.error,
  };
};

export default connect(mapStateToProps, { fetchUser })(App);

import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import Header from './layout/Header';
import User from './user/User';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import Home from './pages/Home';
import Help from './pages/Help';
// import Recorder from './recording/Recorder';
// import Editor from './recording/Editor';
import { fetchUser } from '../actions';
import Error from './layout/Error';
import Mobile from './pages/Mobile';

import history from '../history';

const App = ({ signedIn, fetchUser, error, user }) => {
  useEffect(() => {
    if (signedIn && !user) {
      fetchUser();
    }
  }, [fetchUser, signedIn, user]);

  return (
    <>
      <div id="modal" />
      <div className="container">
        <Error />
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
            <Route path="/mobile" exact component={Mobile} />
            {/* <Route path="/:bandName/record" exact component={Recorder} />
            <Route path="/:bandName/edit" component={Editor} /> */}
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
    user: state.auth.user,
    error: state.error.error,
  };
};

export default connect(mapStateToProps, { fetchUser })(App);

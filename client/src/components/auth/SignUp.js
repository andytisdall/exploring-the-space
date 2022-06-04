import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import history from '../../history';
import { signUp } from '../../actions';
import UserForm from '../user/UserForm';

const SignUp = ({ signUp, isSignedIn }) => {
  useEffect(() => {
    if (isSignedIn) {
      history.push('/user');
    }
  }, [isSignedIn]);

  return (
    <div className="auth">
      <div className="help-header">Exploring the Space</div>
      <h1>Sign Up</h1>
      <UserForm onSubmit={(formValues) => signUp(formValues)} />
      <div className="home-buttons">
        <Link to="/">Home</Link>
        <Link to="signin">Sign In</Link>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return { isSignedIn: state.auth.isSignedIn };
};

export default connect(mapStateToProps, { signUp })(SignUp);

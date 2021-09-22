import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import history from '../history';
import { signIn } from '../actions';
import UserForm from './UserForm';


const SignIn = ({ signIn, isSignedIn }) => {

    useEffect(() => {
        if (isSignedIn) {
            history.push('/user')
        }
    }, []);

    return (

        <div className="auth">
            <div className="help-header">
                Exploring the Space
            </div>
            <h1>Sign In</h1>
            <UserForm onSubmit={formValues => signIn(formValues)}/>
            <div className="home-buttons">
                <Link to="/">
                    Home
                </Link>
                <Link to="signup">
                    Sign Up
                </Link>
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return { isSignedIn: state.auth.isSignedIn };
}

export default connect(mapStateToProps, { signIn })(SignIn);
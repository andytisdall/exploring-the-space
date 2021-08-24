import { connect } from 'react-redux';
import React, { useEffect } from 'react';

import history from '../history';
import { signIn } from '../actions';
import UserForm from './UserForm';


const SignIn = ({ signIn, isSignedIn }) => {

    useEffect(() => {
        if (isSignedIn) {
            history.push('/user')
        }
    }, []);

    return <>
        <h1>Sign In</h1>
        <UserForm onSubmit={formValues => signIn(formValues)}/>
    </>;
};

const mapStateToProps = state => {
    return { isSignedIn: state.auth.isSignedIn };
}

export default connect(mapStateToProps, { signIn })(SignIn);
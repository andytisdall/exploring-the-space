import { connect } from 'react-redux';
import React from 'react';

import { signIn } from '../actions';
import UserForm from './UserForm';


const SignIn = ({ signIn, isSignedIn }) => {
    return <>
        <h1>Sign In</h1>
        <UserForm onSubmit={formValues => signIn(formValues)}/>
    </>;
};

const mapStateToProps = state => {
    return { isSignedIn: state.auth.isSignedIn };
}

export default connect(mapStateToProps, { signIn })(SignIn);
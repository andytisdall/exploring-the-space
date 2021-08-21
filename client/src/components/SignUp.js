import { connect } from 'react-redux';
import React, { useEffect } from 'react';

import history from '../history';
import { signUp } from '../actions';
import UserForm from './UserForm';


const SignUp = ({ signUp, isSignedIn }) => {

    useEffect(() => {
        if (isSignedIn) {
            history.push('/user')
        }
    }, []);

    return <>
        <h1>Sign Up</h1>
        <UserForm onSubmit={formValues => signUp(formValues)}/>
    </>;
};

const mapStateToProps = state => {
    return { isSignedIn: state.auth.isSignedIn };
}

export default connect(mapStateToProps, { signUp })(SignUp);
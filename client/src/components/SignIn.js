import { connect } from 'react-redux';
import React from 'react';

import { signIn } from '../actions';
import UserForm from './UserForm';


const SignIn = ({ signIn }) => {
    
    return <>
        <h1>Sign In</h1>
        <UserForm onSubmit={formValues => signIn(formValues)}/>
    </>;
};



export default connect(null, { signIn })(SignIn);
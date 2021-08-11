
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { signOut } from '../actions';


const SignOut = ({ signOut }) => {

    useEffect(() => {
        signOut();
    }, []);
    
    return <>
        <h1>You Signed Out</h1>
        <div className="signin">
            <Link to="/signin">
                Sign Back In
            </Link>
        </div>
    </>;
};



export default connect(null, { signOut })(SignOut);
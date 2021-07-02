import React from 'react';

const AuthControl = props => {
    if (props.isAuth) {
        return <>
            {props.children}
        </>
    }
};

export default AuthControl;
import React from 'react';
import { connect } from 'react-redux';

const AuthControl = ({ user, currentBand, children }) => {
    if (user && user.bands.includes(currentBand)) {
        return <>
            {children}
        </>
    } else {
        return null;
    }
};

const mapStateToProps = state => {
    return {
        user: state.auth.user,
        currentBand: state.bands.currentBand
    }
};

export default connect(mapStateToProps)(AuthControl);
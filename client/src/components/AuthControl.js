import React from 'react';
import { connect } from 'react-redux';

const AuthControl = ({ user, currentBand, children }) => {
    if (user.bands.includes(currentBand)) {
        return <>
            {children}
        </>
    }
};

const mapStateToProps = state => {
    return {
        user: state.auth.user,
        currentBand: state.bands.currentBand
    }
};

export default connect(mapStateToProps)(AuthControl);
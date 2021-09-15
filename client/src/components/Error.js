
import React from 'react';
import { connect } from 'react-redux';
import { throwError } from '../actions';

const Error = ({ error, throwError }) => {

    if (!error) {
        return null;
    }

    return (
        <div className="error" onClick={() => throwError(null)}>
            {error}
        </div>
    );

};

const mapStateToProps = state => {
    return {
        error: state.error.error
    }
}

export default connect(mapStateToProps, { throwError })(Error);
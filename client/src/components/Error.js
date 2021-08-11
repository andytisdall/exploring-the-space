
import React from 'react';
import { connect } from 'react-redux';


const Error = ({ error }) => {

    if (!error) {
        return null;
    }

    return (
        <div className="error">
            {error.message}
        </div>
    );

};

const mapStateToProps = state => {
    return {
        error: state.error.error
    }
}

export default connect(mapStateToProps)(Error);
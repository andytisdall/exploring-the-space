
import React from 'react';
import { connect } from 'react-redux';


const Error = props => {

    if (!props.errors.error) {
        return null;
    }

    return (
        <div className="error">
            {props.errors.error}
        </div>
    );

};

const mapStateToProps = state => {
    return {
        errors: state.errors
    }
}

export default connect(mapStateToProps)(Error);
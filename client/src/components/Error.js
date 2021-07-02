
import React from 'react';

const Error = props => {

    if (!props.error) {
        return null;
    }

    return (
        <div className="error">
            {props.error.message}
        </div>
    );

};

export default Error;
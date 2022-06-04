import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { throwError } from '../../actions';
import history from '../../history';

const Error = ({ error, throwError }) => {
  useEffect(() => {
    history.listen(() => {
      throwError(null);
    });
  }, [throwError]);

  if (!error) {
    return null;
  }

  return (
    <div className="error" onClick={() => throwError(null)}>
      <div className="error-x">X</div>
      {error}
      <div className="error-x">X</div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    error: state.error.error,
  };
};

export default connect(mapStateToProps, { throwError })(Error);

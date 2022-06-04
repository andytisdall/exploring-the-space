import React from 'react';
import { connect } from 'react-redux';

const requireAuth = (ChildComponent) => {
  class ComposedComponent extends React.Component {
    state = { authorized: false };

    componentDidMount() {
      this.checkAuth();
    }

    // componentDidUpdate() {
    //     this.checkAuth();
    // }

    handleUpdate = () => {
      this.checkAuth();
    };

    checkAuth() {
      if (
        this.props.user &&
        this.props.currentBand &&
        this.props.user.bands.includes(this.props.currentBand.id)
      ) {
        this.setState({ authorized: true });
      }
    }

    render() {
      return (
        <ChildComponent
          {...this.props}
          authorized={this.state.authorized}
          handleUpdate={this.handleUpdate}
        />
      );
    }
  }

  const mapStateToProps = (state) => {
    return {
      user: state.auth.user,
      currentBand: state.bands.currentBand,
    };
  };

  return connect(mapStateToProps)(ComposedComponent);
};

export default requireAuth;

import React from 'react';
import { connect } from 'react-redux';

export default ChildComponent => {

    class ComposedComponent extends React.Component {

        constructor(props) {
            super(props);
        }

        state = { authorized: false };

        componentDidMount() {
            this.checkAuth();
        }


        // componentDidUpdate() {
        //     this.checkAuth();
        // }

        handleUpdate = () => {
            this.checkAuth();
        }

        checkAuth() {
            if (this.props.user && this.props.currentBand && this.props.user.bands.includes(this.props.currentBand.id)) {
                this.setState({ authorized: true });
            }
        }

        render() {

            return <ChildComponent {...this.props} authorized={this.state.authorized} handleUpdate={this.handleUpdate} />;

        }

    }

    const mapStateToProps = state => {
        return {
            user: state.auth.user,
            currentBand: state.bands.currentBand
        }
    };

    return connect(mapStateToProps)(ComposedComponent);

};


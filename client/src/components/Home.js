import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { fetchBands } from '../actions';

class Home extends React.Component {


    componentDidMount() {
        this.props.fetchBands();
    }

    renderBands() {

        const bands = Object.values(_.omit(this.props.bands, this.props.bands.currentBand));

        return bands.map(band => {
            return (
                <div key={band.id}>
                    <Link to={`/${band.url}`}>
                        <h2>{band.name}</h2>
                    </Link>
                </div>
            );
        });

    }


    render() {
        return (
            <div className="container">
                <h1 className="home-header">Exploring the Space</h1>
                <div className="home-buttons">
                    <Link to="/signin">
                        Sign In
                    </Link>
                    <Link to="/signup">
                        Sign Up
                    </Link>
                </div>
                <h1>All Bands:</h1>
                <div className="band-list">
                    {this.props.bands && this.renderBands()}
                </div>
            </div>
        );
    }


}

const mapStateToProps = state => {
    return {
        bands: state.bands
    };
};

export default connect(mapStateToProps, { fetchBands })(Home);
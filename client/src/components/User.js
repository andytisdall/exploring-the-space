import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { createBand, fetchBands, fetchUser } from '../actions';
import AddButton from './AddButton';

const User = ({ user, bands, createBand, fetchBands }) => {

    useEffect(() => {
        fetchBands();
    }, []);

    const renderBands = () => {
        const bandList = user.bands.map(id => bands[id]);
        if (!bandList.length || !bandList[0]) {
            return <h3>No bands belong to this user</h3>
        }
        return bandList.map(band => {
            return <Link key={band.id} to={`/${band.name}`}>
                <h2>{band.name}</h2>
            </Link>
        });
    };

    const onCreateBandSubmit = formValues => {
        createBand(formValues);
    };

    return <>
        <h1>{user.username}'s bands</h1>
        <div className="row band-list">
            {renderBands()}
        </div>
        <hr />
        <div className="centered-button">
            <AddButton
                onSubmit={onCreateBandSubmit}
                title='Create a Band'
                image="images/add.png"
                fields={[{
                    label: 'Band Name',
                    name: 'bandName',
                    type: 'input'
                }]}
            />
        </div>
    </>;

};

const mapStateToProps = state => {
    return {
        user: state.auth.user,
        bands: state.bands
    };
};

export default connect(mapStateToProps, { createBand, fetchBands })(User);
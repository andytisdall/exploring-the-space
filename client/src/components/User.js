import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { createBand, fetchBands, editBand, deleteBand } from '../actions';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';

const User = ({ user, bands, createBand, fetchBands, editBand, deleteBand }) => {

    useEffect(() => {
        fetchBands();
    }, []);

    const renderBands = () => {
        const bandList = user.bands.map(id => bands[id]);
        if (!bandList.length || !bandList[0]) {
            return <h3>No bands belong to this user</h3>
        }
        return bandList.map(band => {
            if (band) {
                return (
                    <div className="band-item" key={band.id}>
                        <Link to={`/${band.url}`}>
                            <h2>{band.name}</h2>
                        </Link>
                        <div className="band-buttons">
                            <AddButton
                                onSubmit={formValues => editBand(formValues)}
                                title={`Edit ${band.name}`}
                                image="images/edit.png"
                                fields={[{
                                    label: 'Band Name',
                                    name: 'name',
                                    type: 'input'
                                }]}
                                initialValues={{ name: band.name }}
                                enableReinitialize={true}
                                form={`edit-band-${band.id}`}
                            />
                            <DeleteButton
                                onSubmit={() => deleteBand(band.id)}
                                displayName={band.name}
                            />
                        </div>
                    </div>                   
                );
            }
        });
    };

    if (user) {
        return <>
            <h1>{user.username}'s bands</h1>
            <div className="row band-list">
                {renderBands()}
            </div>
            <hr />
            <div className="centered-button">
                <AddButton
                    onSubmit={formValues => createBand(formValues)}
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
    } else {
        return null;
    }

};

const mapStateToProps = state => {
    return {
        user: state.auth.user,
        bands: state.bands
    };
};

export default connect(mapStateToProps, { createBand, fetchBands, editBand, deleteBand })(User);
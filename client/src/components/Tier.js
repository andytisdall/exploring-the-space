import React from 'react';
import { connect } from 'react-redux';
import { createTier } from '../actions';


import Title from './Title';
import AuthControl from './AuthControl';
import AddButton from './AddButton';


const Tier = ({ tier, createTier }) => {

    const renderTitles = () => {
        return tier.trackList.map(title => {
            return (
                // <Title />
                <p>This is a Title!</p>
            );
        });
    };

    const onSubmit = formValues => {
        createTier(formValues);
    };

    return (
        <>
            <div className="row tier">
                <div className="tier-name">
                    <img className="arrow" src="right-arrow.svg" />
                    <h2>{tier.name}</h2>
                </div>
                <div className="tier-count">
                    <AuthControl>
                        <AddButton
                            onSubmit={onSubmit}
                            title='Add a Tier'
                            image= '/images/add.png'
                            fields={[{
                                label: 'Tier Name',
                                name: 'tierName',
                                type: 'input',               
                            }]}
                        />
                    </AuthControl>
                    <div className="song-count">{tier.tracklist.length} songs</div>
                    <div className="song-count">{tier.totalTime}</div>
                </div>
                <div className="tier-display">
                    <AuthControl>
                        <AddButton title={`Edit ${tier.name}`} />
                        {/* <DeleteButton /> */}
                    </AuthControl>
                </div>
            </div>
            <div className="title-container">
                {renderTitles()}
            </div>
        </>
    );
};


export default connect(null, { createTier })(Tier);
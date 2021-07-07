import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { createTier, fetchTitles } from '../actions';


import Title from './Title';
import AuthControl from './AuthControl';
import AddButton from './AddButton';


const Tier = ({ tier, createTier, titles, fetchTitles }) => {

    const [expand, setExpand] = useState(false);

    const arrow = expand ? 'down' : 'right';

    const renderTitles = () => {

        const titlesToRender = tier.trackList.map(id => titles[id]);

        return titlesToRender.map(title => {
            if (title) {
                return (
                    <Title title={title} tier={tier} key={title.id} />
                );
            }
        });
    };

    const onSubmit = formValues => {
        createTier(formValues);
    };

    useEffect(() => {
        fetchTitles(tier.id);
    }, []);


    return (
        <>
            <div className="row tier" onClick={() => setExpand(!expand)}>
                <div className="marqee tier-info">
                    <div className="tier-name">
                        <img className="arrow" src={`images/${arrow}-arrow.svg`} />
                        <h2>{tier.name}</h2>
                    </div>
                    <div className="tier-count">
                        <AuthControl>
                            <AddButton
                                onSubmit={onSubmit}
                                title='Add a Tier'
                                img="/images/add.png"
                                fields={[{
                                    label: 'Tier Name',
                                    name: 'tierName',
                                    type: 'input',               
                                }]}
                            />
                        </AuthControl>
                        <div className="song-count">{tier.trackList.length} songs</div>
                        <div className="song-count">{tier.totalTime}</div>
                    </div>
                    <div className="tier-display">
                        <AuthControl>
                            <AddButton title={`Edit ${tier.name}`} />
                            {/* <DeleteButton /> */}
                        </AuthControl>
                    </div>
                </div>
                <hr />
            </div>
            <div className="title-container">
                {expand && renderTitles()}
            </div>
        </>
    );
};

const mapStateToProps = state => {
    return {
        titles: state.titles
    }
};


export default connect(mapStateToProps, { createTier, fetchTitles })(Tier);
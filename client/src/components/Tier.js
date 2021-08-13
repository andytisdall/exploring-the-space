import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { createTier, editTier, fetchTitles } from '../actions';
import Title from './Title';
import AddButton from './AddButton';
import requireAuth from './requireAuth';


const Tier = ({ tier, titles, fetchTitles, authorized, band, tiers }) => {

    const [expand, setExpand] = useState(false);

    const [titlesToRender, setTitlesToRender] = useState(null);

    const arrow = expand ? 'down' : 'right';

    useEffect(() => {
        if (tier.trackList && (!titlesToRender || !titlesToRender[0])) {
            setTitlesToRender(tier.trackList.map(id => titles[id]));
        }
    });

    const renderTitles = () => {
        return titlesToRender.map(title => {
            if (title) {
                return (
                    <Title title={title} tier={tier} key={title.id} />
                );
            }
        });
    };


    useEffect(() => {
        fetchTitles(tier.id);
    }, []);




    const renderEditDelete = () => {
        if (authorized) {

            const tiersToShow = band.tiers.map(id => tiers[id]);

            const tierList = tiersToShow.map(t => {
                return { value: t.position, display: t.position }
            });

            return (
                <AddButton
                    title={`Edit ${tier.name}`}
                    image="images/edit.png"
                    fields={[
                        {
                            label: 'Tier Name',
                            name: 'name',
                            type: 'input',          
                        }, {
                            label: 'Tier Position',
                            name: 'position',
                            type: 'select',
                            options: tierList,
                        }
                    ]}
                    onSubmit={formValues => editTier(formValues)}
                    initialValues={_.pick(tier, 'name', 'position')}
                    form={tier.id}
                />
            )
        }
    }


    return (
        <>
            <div className="row tier" onClick={() => setExpand(!expand)}>
                <div className="marqee tier-info">
                    <div className="tier-name">
                        <img className="arrow" src={`images/${arrow}-arrow.svg`} />
                        <h2>{tier.name}</h2>
                    </div>
                    <div className="tier-count">
                        <div className="song-count">{tier.trackList.length} songs</div>
                        <div className="song-count">{tier.totalTime}</div>
                    </div>
                    <div className="tier-display">
                        {renderEditDelete()}
                    </div>
                </div>
                <hr />
            </div>
            <div className="title-container">
                {expand && titlesToRender && renderTitles()}
            </div>
        </>
    );
};

const mapStateToProps = state => {
    return {
        titles: state.titles,
        band: state.bands.currentBand,
        tiers: state.tiers
    }
};


export default connect(mapStateToProps, { createTier, fetchTitles, editTier })(requireAuth(Tier));
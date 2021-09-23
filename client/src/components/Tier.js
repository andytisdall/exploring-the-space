import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { createTier, editTier, fetchTitles, createTitle, deleteTier } from '../actions';
import Title from './Title';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import requireAuth from './requireAuth';


const Tier = ({ tier, titles, fetchTitles, authorized, band, tiers, editTier, createTitle, deleteTier }) => {

    const [expand, setExpand] = useState(false);

    const [titlesToRender, setTitlesToRender] = useState(null);

    const [tierList, setTierList] = useState([]);

    const [times, setTimes] = useState({});

    const orderedTitles = useRef({});

    useEffect(() => {
        fetchTitles(tier.id);
    }, []);

    useEffect(() => {
        setTitlesToRender(tier.trackList
            .map(id => titles[id]));
    }, [titles, tier]);

    useEffect(() => {
        if (band.tiers.length) {
            const tiersToShow = band.tiers
                .map(id => tiers[id])
                .sort((a, b) => a.position < b.position ? -1 : 1);

            setTierList(tiersToShow.map(t => {
                if (t) {
                    return { value: t.position, display: t.position };
                }
            }));
        }
    }, [tiers]);

    const findLatest = (title, bounce) => {
        if (!orderedTitles.current[title.id]) {
            orderedTitles.current[title.id] = new Date(bounce.date);
        }
    };

    const renderTitles = () => {

        let titleList = titlesToRender;

        titleList = titlesToRender.sort((a, b) => {
            if (orderedTitles.current[a.id] && orderedTitles.current[b.id]) {
                if (orderedTitles.current[a.id] > orderedTitles.current[b.id]) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (orderedTitles.current[a.id]) {
                return -1;
            } else if (orderedTitles.current[b.id]) {
                return 1;
            }
        });
        

        return titleList.map(title => {
            if (title) {
                return (
                    <Title title={title} tier={tier} key={title.id} getTime={getTime} findLatest={findLatest}/>
                );
            }
        });
    };


    const renderAddButton = () => {
        if (authorized) {
            return (
                <AddButton
                    title={`Add a Title to ${tier.name}`}
                    image="images/add.png"
                    fields={[
                        {
                            label: 'Title',
                            name: 'title',
                            type: 'input',
                            required: true
                        }
                    ]}
                    onSubmit={(formValues) => {
                        createTitle(formValues, tier.id);
                        setExpand(true);
                    }}
                    form={`add-title-${tier.id}`}
                />
            )
        }
    }

    const renderEditButton = () => {
        if (authorized) {

            return (
                <AddButton
                    title={`Edit ${tier.name}`}
                    image="images/edit.png"
                    fields={[
                        {
                            label: 'Tier Name',
                            name: 'name',
                            type: 'input',
                            required: true        
                        }, {
                            label: 'Tier Position',
                            name: 'position',
                            type: 'select',
                            options: tierList,
                        }
                    ]}
                    onSubmit={(formValues) => editTier(formValues, tier.id)}
                    initialValues={_.pick(tier, 'name', 'position')}
                    form={`edit-tier-${tier.id}`}
                    enableReinitialize={true}
                />
            );
        }
    };

    const renderDeleteButton = () => {
        if (authorized) {
            return (
                <DeleteButton
                    onSubmit={() => deleteTier(tier.id)}
                    displayName={tier.name}
                />
            );
        }
    };

    const renderTotalTime = () => {


        const total = Object.values(times).reduce((prev, cur) => {
            return prev + cur;
        }, 0);

        if (!total) {
            return null;
        }

        const minutes = Math.floor(total / 60);
        const seconds = Math.floor(total % 60) < 10 ? '0' + Math.floor(total % 60) : Math.floor(total % 60);
        return (
            <div>
                {`${minutes}:${seconds}`}
            </div>
        );
    };

    const getTime = (track) => {
        if (!times[track.id]) {
            setTimes({ ...times, [track.id]: track.duration });
        }
    };

    const arrow = expand ? 'down-arrow' : '';
    const open = expand ? 'open' : 'closed';

    return (
        <>
            <div className="row tier" onClick={() => setExpand(!expand)}>
                <div className="marqee">
                    <div className="tier-name">
                        <img className={`arrow ${arrow}`} src={`images/right-arrow.svg`} />
                        <h2>{tier.name}</h2>
                        {renderAddButton()}
                    </div>
                    <div className="tier-count">

                        <div className="song-count">{tier.trackList.length} songs</div>
                        <div className="song-count">{renderTotalTime()}</div>
                    </div>
                    <div className="tier-display">
                        {renderEditButton()}
                        {renderDeleteButton()}
                    </div>
                </div>
                <hr />
            </div>
            <div className={`title-container ${open}`}>
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


export default connect(mapStateToProps, { createTier, fetchTitles, editTier, createTitle, deleteTier })(requireAuth(Tier));
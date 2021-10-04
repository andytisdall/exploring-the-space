import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { createTier, editTier, fetchTitles, createTitle, deleteTier, setOrder } from '../actions';
import Title from './Title';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import requireAuth from './requireAuth';


const Tier = ({ tier, titles, fetchTitles, authorized, band, tiers, editTier, createTitle, deleteTier, setOrder }) => {

    const [expand, setExpand] = useState(false);
    const [titlesToRender, setTitlesToRender] = useState(null);
    const [times, setTimes] = useState({});

    const orderedTitles = useRef({});

    useEffect(() => {
        setOrder(tier.id, 'date');
        fetchTitles(tier.id);
    }, []);

    useEffect(() => {
        setTitlesToRender(tier.trackList
            .map(id => titles[id]));
    }, [titles, tier]);

    const findLatest = (title, bounce) => {
        if (!orderedTitles.current[title.id]) {
            orderedTitles.current[title.id] = new Date(bounce.date);
        }
    };

    const renderTitles = () => {

        const titleList = [...titlesToRender];

        if (!tier.orderBy || tier.orderBy === 'date') {

            titleList.sort((a, b) => {
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
        }

        if (tier.orderBy === 'name') {

            titleList.sort((a, b) => {
                return a.title < b.title ? -1 : 1;
            });

        }

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
                <div className="order-by">
                    <div>
                        Add a Title to this Tier
                    </div>
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
                        addClass='add-left'
                    />
                </div>
            );
        }
    };

    const renderEditButton = () => {
        if (authorized) {

            const tierList = band.tiers
                .map(id => tiers[id])
                .sort((a, b) => a.position < b.position ? -1 : 1)
                .map(t => {
                    if (t) {
                        return { value: t.position, display: t.position };
                    }
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
                            required: true        
                        }, {
                            label: 'Tier Position',
                            name: 'position',
                            type: 'select',
                            options: tierList,
                        }
                    ]}
                    onSubmit={(formValues) => editTier(formValues, tier.id)}
                    initialValues={{ name: tier.name, position: tier.position }}
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
        if (times[track.id] !== track.duration) {
            setTimes({ ...times, [track.id]: track.duration });
        }
    };

    const renderOrderButton = () => {
        if (!tier.orderBy || tier.orderBy === 'date') {
            return (
                <div className='order-by'>
                    <div>Order titles by: </div>
                    <div
                        className='order-button order-active'
                        onClick={e => e.stopPropagation()}
                    >
                        Date
                    </div>
                    <div
                        className='order-button'
                        onClick={e => {
                            e.stopPropagation();
                            setOrder(tier.id, 'name');
                        }}
                    >
                        ABC
                    </div>
                </div>
            );
        }
        
        if (tier.orderBy === 'name') {
            return (
                <div className='order-by'>
                    <div>Order titles by:</div>
                    <div
                        className='order-button'
                        onClick={e => {
                            e.stopPropagation();
                            setOrder(tier.id, 'date');
                        }}
                    >
                        Date
                    </div>
                    <div
                        className='order-button order-active'
                        onClick={e => e.stopPropagation()}
                    >
                        ABC
                    </div>
                </div>
            );
        }
    };

    const renderOptions = () => {

        return <>  
            {renderAddButton()}
            {renderOrderButton()}     
        </>;
    };

    const arrow = expand ? 'down-arrow' : '';
    const open = expand ? 'open' : 'closed';

    return (
        <>
            <div className={`row tier ${expand ? 'row-open' : ''}`} onClick={() => setExpand(!expand)}>
                <div className="marqee">
                    <div className="tier-name">
                        <img className={`arrow ${arrow}`} src={`images/right-arrow.svg`} />
                        <h2>{tier.name}</h2>
                        
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
            </div>
            <div className={`tier-options ${expand ? 'options-visible' : ''}`}>
                {expand && renderOptions()}
            </div>
            <hr />
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


export default connect(mapStateToProps, { createTier, fetchTitles, editTier, createTitle, deleteTier, setOrder })(requireAuth(Tier));
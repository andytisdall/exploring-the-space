import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import requireAuth from './requireAuth';
import { selectBounce, createBounce, editBounce, deleteBounce } from '../actions';

const Bounce = ({ bounces, selectBounce, title, authorized, version, createBounce, editBounce, deleteBounce }) => {

    const [selectedBounce, setSelectedBounce] = useState(title.selectedBounce);

    const [uploadActive, setUploadActive] = useState(false);

    const [dropdownVisible, setDropdownVisible] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        if (selectedBounce && selectedBounce !== title.selectedBounce) {
            selectBounce(selectedBounce, title.id);
        }
    }, [selectedBounce]);

    useEffect(() => {
        if (selectedBounce && selectedBounce !== title.selectedBounce) {
            selectBounce(title.selectedBounce, title.id);
        }
    }, [title.selectedBounce]);

    useEffect(() => {
        setSelectedBounce(title.selectedBounce);
        setUploadActive(false);
    }, [title.selectedBounce]);

    useEffect(() => {
        if (dropdownVisible) {
            document.addEventListener('click', onBodyClick, {capture: true});
        } else {
            document.removeEventListener('click', onBodyClick, {capture: true});
        }
    }, [dropdownVisible]);

    const onBodyClick = e => {

        if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
            return;
        }

        if (dropdownVisible) {
            setDropdownVisible(false);
        }
    };

    const displayDate = date => {
        return moment.utc(date).format('MM/DD/yy');
    }

    const renderBounceList = () => {
        if (dropdownVisible) {

            const bounceList = bounces.filter(b => b.id !== selectedBounce.id);
            bounceList.sort((a, b) => a.date < b.date ? 1 : -1);

            return bounceList.map(b => {
                const current = b.latest ? <span className="list-current"> * current</span> : null;
                return <div
                    className="dropdown-link"
                    onClick={() => {
                        setSelectedBounce(b);
                        setDropdownVisible(false);
                    }}
                    key={b.id}
                >
                    {displayDate(b.date)}
                    {current}
                </div>
            });
        }
    };

    const onAddSubmit = (formValues) => {

        createBounce(formValues, version.id, title.id);
        setUploadActive(true);

    };

    const onEditSubmit = (formValues) => {

        editBounce(formValues, selectedBounce.id, version.id);
        setUploadActive(true);

    };

    const uploadContent = () => {
        return (

                <div className='upload-image'>
                    <p>Uploading...</p>
                    <img className='windmill' src='/images/windmill.gif' />
                </div>

        );
    };

    const renderAddButton = () => {
        if (authorized) {
            return (
                <AddButton
                    title={`Add a Bounce of ${version.name}`}
                    image="images/add.png"
                    fields={[
                        {
                            label: 'File',
                            name: 'file',
                            type: 'file',
                            required: true
                        },
                        {
                            label: 'Date',
                            name: 'date',
                            type: 'date',
                            required: true         
                        },
                        {
                            label: 'Comments',
                            name: 'comments',
                            type: 'textarea',          
                        },
                        {
                            label: 'Latest Bounce?',
                            name: 'latest',
                            type: 'checkbox',        
                        },
                    ]}
                    onSubmit={formValues => onAddSubmit(formValues)}
                    form={`add-bounce-${title.id}`}
                    initialValues={{ latest: true }}
                    addClass='add-bounce'
                />
            );
        }
    };

    const renderEditButton = () => {
        if (authorized) {
            return <AddButton
                title={'Edit this Bounce'}
                image="images/edit.png"
                fields={[
                    {
                        label: 'File',
                        name: 'file',
                        type: 'file', 
                    },
                    {
                        label: 'Date',
                        name: 'date',
                        type: 'date',          
                    },
                    {
                        label: 'Comments',
                        name: 'comments',
                        type: 'textarea',          
                    },
                    {
                        label: 'Current Bounce?',
                        name: 'latest',
                        type: 'checkbox',        
                    },
                ]}
                onSubmit={onEditSubmit}
                initialValues={
                    { ..._.pick(selectedBounce, 'comments', 'latest'), date: moment.utc(selectedBounce.date).format('YYYY-MM-DD') }
                }
                form={`edit-bounce-${title.id}`}
                enableReinitialize={true}
                addClass='add-bounce'
            />;
        }
    };

    const renderDeleteButton = () => {
        if (authorized) {
            return <DeleteButton
                onSubmit={() => deleteBounce(selectedBounce.id, version.id, title.id)}
                displayName={displayDate(selectedBounce.date)}
            />;
        }
    };

    const latestTag = () => {
        if (selectedBounce.latest) {
            return (
                <div className="current">
                    Current
                </div>
            );
        }
    };

    const bounceCount = () => {
        let count;
        if (bounces.length === 1) {
            count = '1 Bounce:';
        } else {
            count = `${bounces.length} Bounces:`
        }

        return (
            <h5>
                {count}
            </h5>
        );
    };
    

    const renderBounceDetail = () => {
        if (selectedBounce) {
            return (
                <div className='detail-content'>
                    <div className='detail-header'>
                        {bounceCount()}
                        <div className='dropdown' ref={dropdownRef}>
                            <button
                                className='dropbtn'
                                onClick={() => setDropdownVisible(!dropdownVisible)}
                            >
                                {displayDate(selectedBounce.date)}
                            </button>
                            <div className='dropdown-content'>
                                {renderBounceList()}
                            </div>
                        </div>                       
                        {latestTag()}
                    </div>
                    <div className='detail-notes'>
                        <div className="detail-notes-title">Notes:</div>
                        <p>{selectedBounce.comments}</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="detail-content">
                    <div className="detail-header">
                        <h5>No Bounces for this Version</h5>
                    </div>
                </div>
            );
        }
    };
    

    if (uploadActive) {
        return <div className="detail-box bounce">
            {uploadContent()}
        </div>
    } else {
        if (version) {
            return (
                <div className="detail-box bounce">   
                    {renderBounceDetail()}                                            
                    <div className="detail-buttons">
                        {renderAddButton()}
                        {selectedBounce && renderEditButton()}
                        {selectedBounce && renderDeleteButton()}
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
};

export default connect(null, { selectBounce, createBounce, editBounce, deleteBounce })(requireAuth(Bounce));
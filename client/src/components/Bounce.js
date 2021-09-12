import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import requireAuth from './requireAuth';
import { selectBounce, createBounce, editBounce, deleteBounce } from '../actions';
import Modal from './Modal';

const Bounce = ({ bounces, selectBounce, title, authorized, version, createBounce, editBounce, deleteBounce }) => {

    const [selectedBounce, setSelectedBounce] = useState(title.selectedBounce);

    const [modalActive, setModalActive] = useState(false);

    useEffect(() => {
        if (selectedBounce) {
            selectBounce(selectedBounce, title.id);
        }
    }, [selectedBounce]);

    useEffect(() => {
        setSelectedBounce(title.selectedBounce);
        setModalActive(false);
    }, [bounces]);

    const displayDate = date => {
        return moment.utc(date).format('MM/DD/yy');
    }

    const renderBounceList = () => {

        if (bounces[0]) {

            const bounceList = bounces.filter(b => b.id !== selectedBounce.id);

            return bounceList.map(b => {
                return <div
                    className="dropdown-link change-song"
                    onClick={() => setSelectedBounce(b)}
                    key={b.id}
                >
                        {displayDate(b.date)}
                </div>
            });
        }
    };

    const onAddSubmit = (formValues) => {

        createBounce(formValues, version.id, title.id);
        setModalActive(true);

    };

    const modalContent = () => {
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
                            type: 'file'
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
                            label: 'Latest Bounce?',
                            name: 'latest',
                            type: 'checkbox',        
                        },
                    ]}
                    onSubmit={formValues => onAddSubmit(formValues)}
                    form={`add-bounce-${title.id}`}
                    initialValues={{ latest: true }}
                    addClass="bounce"
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
                        label: 'Latest Bounce?',
                        name: 'latest',
                        type: 'checkbox',        
                    },
                ]}
                onSubmit={formValues => editBounce(formValues, selectedBounce.id)}
                initialValues={_.pick(selectedBounce, 'date', 'comments', 'latest')}
                form={`edit-bounce-${title.id}`}
                enableReinitialize={true}
            />;
        }
    };

    const renderDeleteButton = () => {
        return <DeleteButton
            onSubmit={() => deleteBounce(selectedBounce.id, version.id)}
            displayName={displayDate(selectedBounce.date)}
        />;
    };
    

    const renderBounceDetail = () => {
        if (selectedBounce) {
            return (
                <div className='detail-content'>
                    <div className='detail-header'>
                        <h5>Date:</h5>
                        <div className='dropdown'>
                            <button className='dropbtn'>
                                {displayDate(selectedBounce.date)}
                            </button>
                            <div className='dropdown-content'>
                                {renderBounceList()}
                            </div>
                        </div>
                    </div>
                    <div className='detail-notes'>
                        {selectedBounce.comments}
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

    if (modalActive) {
        return <Modal
            content={modalContent()}
            actions={null}
            onDismiss={() => null}
        />
    } else {
        if (version) {
            return (
                <div className="detail-box">   
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
import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchBounces, selectVersion, createVersion, editVersion, deleteVersion } from '../actions';
import Bounce from './Bounce';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import requireAuth from './requireAuth';

const Version = ({ versions, bounces, fetchBounces, selectVersion, title, createVersion, authorized, editVersion, deleteVersion }) => {

    const [selectedVersion, setSelectedVersion] = useState(title.selectedVersion);
    const [bounceList, setBounceList] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        // console.log(selectedVersion);
        if (selectedVersion !== title.selectedVersion) {
            selectVersion(selectedVersion, title.id);
            setBounceList(selectedVersion.bounces.map(id => bounces[id]));
            fetchBounces(selectedVersion.id)
        } 
    }, [selectedVersion]);

    useEffect(() => {
        if (selectedVersion) {
            setBounceList(selectedVersion.bounces.map(id => bounces[id]));
        }
    }, [bounces]);

    useEffect(() => {
        if (title.selectedVersion && selectedVersion !== title.selectedVersion) {
            setSelectedVersion(title.selectedVersion);
            fetchBounces(title.selectedVersion.id);
        }
    }, [versions, title.selectedVersion]);

    useEffect(() => {
        if (dropdownVisible) {
            document.addEventListener('click', onBodyClick, {capture: true});
        } else {
            document.removeEventListener('click', onBodyClick, {capture: true});
        }
    }, [dropdownVisible]);


    
    const versionCount = () => {
        let count;
        if (versions.length === 1) {
            count = '1 Version:';
        } else {
            count = `${versions.length} Versions:`
        }

        return (
            <h5>{count}</h5>
        );
    };
    
    const renderBounces = () => {

        if (bounceList) {

            return (
                <Bounce bounces={bounceList} title={title} version={selectedVersion} />
            );
        
            
        }
    };

    const renderAddButton = () => {
        if (authorized) {
            return (
                <AddButton
                    title={`Add a Version of ${title.title}`}
                    image="images/add.png"
                    fields={[
                        {
                            label: 'Name',
                            name: 'name',
                            type: 'input',
                            required: true         
                        },
                        {
                            label: 'Notes',
                            name: 'notes',
                            type: 'textarea',          
                        },
                        {
                            label: 'Current Version?',
                            name: 'current',
                            type: 'checkbox',      
                        },
                    ]}
                    onSubmit={(formValues) => createVersion(formValues, title.id)}
                    form={`add-version-${title.id}`}
                    initialValues={{ current: true }}
                    enableReinitialize={true}
                    addClass='add-version'
                />
            );
        }
    };

    const renderEditButton = () => {
        if (authorized) {
            return <AddButton
                title={`Edit ${selectedVersion.name}`}
                image="images/edit.png"
                fields={[
                    {
                        label: 'Name',
                        name: 'name',
                        type: 'input', 
                    },
                    {
                        label: 'Notes',
                        name: 'notes',
                        type: 'textarea',          
                    },
                    {
                        label: 'Current Version?',
                        name: 'current',
                        type: 'checkbox',        
                    },
                ]}
                onSubmit={formValues => editVersion(formValues, selectedVersion.id, title.id)}
                initialValues={_.pick(selectedVersion, 'name', 'notes', 'current')}
                form={`edit-version-${title.id}`}
                enableReinitialize={true}
                addClass='add-version'
            />;
        }
    };

    const renderDeleteButton = () => {
        if (authorized) {
            return <DeleteButton
                onSubmit={() => deleteVersion(selectedVersion.id, title.id)}
                displayName={selectedVersion.name}
            />;
        }
    };

    const latestTag = () => {
        if (selectedVersion.current) {
            return (
                <div className="current">
                    Current
                </div>
            );
        }
    };

    const renderVersionList = () => {
        if (dropdownVisible) {
            const versionList = versions.filter(v => v.id !== selectedVersion.id);

            return versionList.map(v => {
                const current = v.current ? <span className="list-current"> * current</span> : null;
                return <div
                    className="dropdown-link"
                    onClick={() => {
                        setSelectedVersion(v);
                        setDropdownVisible(false);
                    }}
                    key={v.id}
                >
                        {v.name}
                        {current}
                </div>
            });
        }
    };

    const onBodyClick = e => {

        if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
            return;
        }

        if (dropdownVisible) {
            setDropdownVisible(false);
        }
    };

    const renderVersionDetail = () => {
        if (selectedVersion) {
            return (
                <div className="detail-content">
                    <div className="detail-header">
                        {versionCount()}
                        <div className="dropdown" ref={dropdownRef}>
                            <button
                                className="dropbtn"
                                onClick={() => setDropdownVisible(!dropdownVisible)}
                            >
                                {selectedVersion.name}
                            </button>
                            <div className="dropdown-content">
                                {renderVersionList()}
                            </div>
                        </div>
                        {latestTag()}
                    </div>
                    <div className="detail-notes">
                        <div className="detail-notes-title">Notes:</div>
                        <p>{selectedVersion.notes}</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="detail-content">
                    <div className="detail-header">
                        <h5>No Versions for this Song Yet</h5>
                    </div>
                </div>
            );
        }
    };



    
    return <>
            <div className="detail-box">
                {renderVersionDetail()}      
                <div className="detail-buttons">
                    {renderAddButton()}
                    {selectedVersion && renderEditButton()}
                    {selectedVersion && renderDeleteButton()}
                </div>
            </div>
            {renderBounces()}          
    </>;
};

const mapStateToProps = state => {
    return {
        bounces: state.bounces
    };
}

export default connect(mapStateToProps, { fetchBounces, selectVersion, createVersion, editVersion, deleteVersion })(requireAuth(Version));
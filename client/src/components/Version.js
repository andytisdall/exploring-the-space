import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        // console.log(selectedVersion);
        if (selectedVersion) {
            fetchBounces(selectedVersion.id);
            selectVersion(selectedVersion, title.id);
            setBounceList(selectedVersion.bounces.map(id => bounces[id]));
        }
    }, [selectedVersion]);

    useEffect(() => {
        if (selectedVersion) {
            setBounceList(selectedVersion.bounces.map(id => bounces[id]));
        }
    }, [bounces]);

    useEffect(() => {
        setSelectedVersion(title.selectedVersion);
    }, [versions, title.selectedVersion]);

    const renderVersionList = () => {
        const versionList = versions.filter(v => v.id !== selectedVersion.id);

        return versionList.map(v => {
            return <div
                className="dropdown-link change-version"
                onClick={() => setSelectedVersion(v)}
                key={v.id}
            >
                    {v.name}
            </div>
        });
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
            />;
        }
    };

    const renderDeleteButton = () => {
        return <DeleteButton
            onSubmit={() => deleteVersion(selectedVersion.id, title.id)}
            displayName={selectedVersion.name}
        />;
    };

    const latestTag = () => {
        if (selectedVersion.current) {
            return (
                <div className="current">
                    Current Version
                </div>
            );
        }
    };

    const renderVersionDetail = () => {
        if (selectedVersion) {
            return (
                <div className="detail-content">
                    <div className="detail-header">
                        <h5>Version:</h5>
                        <div className="dropdown">
                            <button className="dropbtn">
                                {selectedVersion.name}
                            </button>
                            <div className="dropdown-content">
                                {renderVersionList()}
                            </div>
                        </div>
                        {latestTag()}
                    </div>
                    <div className="detail-notes">
                        {selectedVersion.notes}
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



    
    return (
        <div className="version-container">
            <div className="detail-box">
                {renderVersionDetail()}      
                <div className="detail-buttons">
                    {renderAddButton()}
                    {selectedVersion && renderEditButton()}
                    {selectedVersion && renderDeleteButton()}
                </div>
            </div>
            {renderBounces()}          
        </div>
    );
};

const mapStateToProps = state => {
    return {
        bounces: state.bounces
    };
}

export default connect(mapStateToProps, { fetchBounces, selectVersion, createVersion, editVersion, deleteVersion })(requireAuth(Version));
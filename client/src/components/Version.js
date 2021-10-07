import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchBounces, selectVersion, createVersion, editVersion, deleteVersion } from '../actions';
import Bounce from './Bounce';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import requireAuth from './requireAuth';
import DetailBox from './DetailBox';

const Version = ({ versions, bounces, fetchBounces, selectVersion, title, createVersion, authorized, editVersion, deleteVersion }) => {

    const [selectedVersion, setSelectedVersion] = useState(title.selectedVersion);
    const [bounceList, setBounceList] = useState(null);

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

    const itemList = () => {
        return versions.filter(v => v.id !== selectedVersion.id);
    };

    const displayVersion = v => {
        return `${v.name}`;
    };
    
    return (
        <>
            <DetailBox
                selectedItem={selectedVersion}
                itemType="Version"
                itemList={itemList}
                displayItem={displayVersion}
                setSelected={setSelectedVersion}
                renderAddButton={renderAddButton}
                renderEditButton={renderEditButton}
                renderDeleteButton={renderDeleteButton}
            />
            <div className="version-arrow">&rarr;</div>
            {renderBounces()}          
        </>
    );
};

const mapStateToProps = state => {
    return {
        bounces: state.bounces
    };
}

export default connect(mapStateToProps, { fetchBounces, selectVersion, createVersion, editVersion, deleteVersion })(requireAuth(Version));
import React from 'react';

const  AddButton = props => {

    return (

        <div className="add">
            <img src="add.png" />
            <div className="addbox">
                <h3>{props.title}</h3>
                
            </div>
        </div>

    );

};

export default AddButton;
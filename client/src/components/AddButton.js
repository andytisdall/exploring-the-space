import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';

const  AddButton = props => {

    const {boxVisible, setBoxVisible} = useState(false);

    const showFields = () => {

        return props.fields.map(field => {
            return <>
                <label>{field.label}</label>
                <Field
                    name={field.name}
                    component={field.type}
                >
                    {field.options}
                </Field>

            </>
        })

    }

    const showBox = () => {
        if (boxVisible) {
            return <>    
                <div className="addbox">
                    <h3>{props.title}</h3>
                    <form onSubmit = {props.handleSubmit()}>
                        {showFields(props.fields)}
                        <button type='submit'>OK</button>
                    </form>
                </div>
            </>
        }
    }

    return (

        <div className="add" onClick={() => setBoxVisible(!boxVisible)}>
            <img src="add.png" />
            {showBox()}
        </div>

    );

};

export default reduxForm({ form: 'form' })(AddButton);
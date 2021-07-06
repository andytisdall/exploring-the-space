import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';

const  AddButton = ({ fields, handleSubmit, title, image }) => {

    const [boxVisible, setBoxVisible] = useState(false);

    

    const showFields = () => {

        return fields.map(field => {
            return <>
                <label>{field.label}:</label>
                <Field
                    name={field.name}
                    component={field.type}
                >
                    {field.options.map(option => <option value={option.value}>{option.display}</option>)}
                </Field>
            </>
        });

    };

    const showBox = () => {
        if (boxVisible) {
            return <>    
                <div className="addbox">
                    <h3>{title}</h3>
                    <form onSubmit = {handleSubmit()}>
                        {showFields()}
                        <button type='submit'>OK</button>
                    </form>
                </div>
            </>
        }
    }
    
    return (

        <div className="add" onClick={() => setBoxVisible(!boxVisible)}>
            <img src={image} />
            {showBox()}
        </div>

    );

};

export default reduxForm({ form: 'form' })(AddButton);
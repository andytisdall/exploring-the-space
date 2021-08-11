import React from 'react';
import { Field, reduxForm } from 'redux-form';

class AddButton extends React.Component {

    state = { boxVisible: false };

    showOptions = (options) => {
        return options.map(option => {
            return (
                <option key={option.display} value={option.value}>
                    {option.display}
                </option>
            );
        });
    };

    showFields = () => {

        return this.props.fields.map(field => {
            return <div key={field.label}>
                <label>{field.label}: </label>
                <Field
                    name={field.name}
                    component={field.type}
                >
                    {field.options ? this.showOptions(field.options) : null}
                </Field>
            </div>
        });
 
    };

    submitForm = (formValues) => {
        this.props.onSubmit(formValues);
    }

    showBox = () => {
        if (this.state.boxVisible) {
            return <>    
                <div className="addbox">
                    <h3>{this.props.title}</h3>
                    <form onSubmit = {this.props.handleSubmit(this.submitForm)}>
                        {this.showFields()}
                        <button type='submit'>OK</button>
                    </form>
                </div>
            </>
        }
    }

    click = (e) => {
        e.stopPropagation();
        this.setState({ boxVisible: !this.boxVisible });
    }
    
    render() {
        return (
        <div className="add" onClick={this.click} >
            <img src={this.props.image} />
            {this.showBox()}
        </div>
        );
    }

}

export default reduxForm({ form: 'form' })(AddButton);
import React from 'react';
import { Field, reduxForm } from 'redux-form';

class UserForm extends React.Component {
    
    renderInput = ({ input, label, meta, type, autoComplete }) => {

        return (
            <div>
                <label>{label}</label>
                <input type={type} autoComplete={autoComplete} {...input} /> 
            </div>
        );
    };

    submitForm = formValues => {
        this.props.onSubmit(formValues);
    };


    render() {
        return (
            <form className='signin' onSubmit={this.props.handleSubmit(this.submitForm)}>
                <Field name="username" component={this.renderInput} label="Username: " type="text" autoComplete="username" />
                <Field name="password" component={this.renderInput} label="Passwyrd: " type="password" autoComplete="current-password" />
                <button className="signin-submit">Submit</button>
            </form>
        );
    }


}

export default reduxForm({
    form: 'userForm'
})(UserForm);
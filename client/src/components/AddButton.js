import React from 'react';
import { Field, reduxForm } from 'redux-form';



class AddButton extends React.Component {

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    state = { boxVisible: false };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.boxVisible === false && this.state.boxVisible === true) {
            document.addEventListener('click', this.bodyClick, {capture: true});
        } else if (prevState.boxVisible === true && this.state.boxVisible === false) {
            document.removeEventListener('click', this.bodyClick, {capture: true});
        }
    }

    bodyClick = (e) => {
        if (this.ref.current.contains(e.target)) {
            return;
        }
        if (this.state.boxVisible) {
            this.setState({ boxVisible: false });
        }
    }

    showOptions = (field) => {
        return field.options.map(option => {
            return (
                <option
                    key={option.value}
                    value={option.value}
                >
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
                    {field.options ? this.showOptions(field) : null}
                </Field>
            </div>
        });
 
    };

    submitForm = (formValues) => {
        this.props.onSubmit(formValues);
        this.setState({ boxVisible: false });
    }

    showBox = () => {
        if (this.state.boxVisible) {
            return <>    
                <div className="addbox" ref={this.ref} >
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
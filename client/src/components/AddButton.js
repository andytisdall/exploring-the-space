import React from 'react';
import { Field, reduxForm } from 'redux-form';



class AddButton extends React.Component {

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    state = { boxVisible: false, selectedOption: null };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.boxVisible === false && this.state.boxVisible === true) {
            document.addEventListener('click', this.bodyClick, {capture: true});
            document.addEventListener('keydown', this.blockSpaceBarPress, {capture: true});
        } else if (prevState.boxVisible === true && this.state.boxVisible === false) {
            document.removeEventListener('click', this.bodyClick, {capture: true});
            document.removeEventListener('keydown', this.blockSpaceBarPress, {capture: true});
        }
        
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.bodyClick, {capture: true});
        document.removeEventListener('keydown', this.blockSpaceBarPress, {capture: true});
    }

    blockSpaceBarPress = (e) => {
        e.stopPropagation();
    }

    bodyClick = (e) => {
        if (this.ref.current && this.ref.current.contains(e.target)) {
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

    onDrop = (e, input) => {
        const file = e.target.files[0];
        const { onChange } = input;
        onChange(file);
    }

    input = (field) => {
        let addClass = '';
        if (field.type === 'date') {
            addClass = 'calendar';
        }

        if (field.type === 'file') {
            delete field.input.value;

            return <>
                <div className="form-errors">
                    {field.meta.touched && (field.meta.error && <p>{field.meta.error}<span>&darr;</span></p>)}
                </div>
                <input
                    {...field.input}
                    type='file'
                    className='inputfile'

                    onDrop={(e) => this.onDrop(e, field.input)}
                        
                />
            </>;
        } else if (field.type === 'select') {
            return <>
                <div className="form-errors">
                    {field.meta.touched && (field.meta.error && <p>{field.meta.error}<span>&darr;</span></p>)}
                </div>
                <select
                    {...field.input}
                    autoFocus={field.autoFocus}
                    type={field.type}
                >
                    {field.options ? this.showOptions(field) : null}
                </select>
            </>;
        } else {
            return <>
                <div className="form-errors">
                    {field.meta.touched && (field.meta.error && <p>{field.meta.error}<span>&darr;</span></p>)}
                </div>
                <input
                    {...field.input}
                    autoFocus={field.autoFocus}
                    type={field.type}
                    className={`text-input ${addClass}`}
                />
            </>;
        }
    }

    required = value => {
        return value ? undefined : 'Required';
    }

    showFields = () => {

        return this.props.fields.map((field, i) => {
            const autoFocus = i === 0 ? true : false;
            let comp = this.input;
            // if (field.type === 'select') {
            //     comp = 'select'
            // }
            return <div key={field.label}>
                <label>{field.label}: </label>
                <Field
                    name={field.name}
                    component={comp}
                    autoFocus={autoFocus}
                    type={field.type}
                    validate={field.required ? this.required : null}
                    options={field.options}
                >
                    {field.options ? this.showOptions(field) : null}
                </Field>
            </div>
        });
 
    };

    submitForm = (formValues) => {
        this.props.onSubmit(formValues);
        this.setState({ boxVisible: false });
        this.props.reset();
    }

    showBox = () => {
        if (this.state.boxVisible) {
            const addClass = this.props.addClass ? 'add-bounce' : '';
            return <>    
                <div className={`addbox${addClass}`} onClick={e => e.stopPropagation()}>
                    <h3 className="addbox-title">{this.props.title}</h3>
                    <form onSubmit = {this.props.handleSubmit(this.submitForm)}>
                        {this.showFields()}
                        <div className="submit-button-centered">
                            <button className="submit-button" type='submit'>OK</button>
                        </div>
                    </form>
                </div>
            </>
        }
    }

    click = (e) => {
        e.stopPropagation();
        if (this.ref.current && this.ref.current === e.target) {
            return;
        }
        if (this.state.boxVisible) {
            this.setState({ boxVisible: false });
        } else {
            this.setState({ boxVisible: true });
        }

    }
    
    render() {

        return <>
            <div className="add" onClick={this.click} ref={this.ref}>
                <img src={this.props.image} />
                {this.showBox()}
            </div>
        </>;
    }

}

export default reduxForm({ form: 'form' })(AddButton);
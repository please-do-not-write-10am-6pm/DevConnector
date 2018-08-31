import React, { Component } from 'react';
import axios                from 'axios';
import classnames           from 'classnames';

class Register extends Component {
    constructor () {
        super ();
        this.state = {
            name : '',
            email : '',
            password : '',
            password2 : '',
            errors : {}
        };

        // This is to bind the onChange listener function with the 'this' of the state (We don't need these if we use arrow functions like in Login component)
        this.onChange = this.onChange.bind ( this );
        this.onSubmit = this.onSubmit.bind ( this );
    }

    // We need this for 2 way binding
    onChange ( e ) {
        this.setState ( { [ e.target.name ] : e.target.value } );
    }

    onSubmit ( e ) {
        e.preventDefault ();

        const newUser = {
            name : this.state.name,
            email : this.state.email,
            password : this.state.password,
            password2 : this.state.password2
        };

        axios.post ( '/api/users/register', newUser )
            .then ( res => console.log ( res.data ) )
            .catch ( err => this.setState ( { errors : err.response.data } ) );
    }

    render () {
        const { errors } = this.state;

        return (
            <div className="register">
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 m-auto">
                            <h1 className="display-4 text-center">Sign Up</h1>
                            <p className="lead text-center">Create your DevConnector account</p>
                            <form noValidate
                                  onSubmit={ this.onSubmit } /* Avoid the native html5 validation for email */ >
                                <div className="form-group">
                                    <input type="text"
                                           className={ classnames ( 'form-control form-control-lg',
                                               { 'is-invalid' : errors.name } ) }  // is-invalid class is rendered only if we have errors.name
                                           placeholder="Name" name="name"
                                           onChange={ this.onChange } value={ this.state.name }/>
                                    { errors.name && ( <div className='invalid-feedback'>{ errors.name }</div> ) }
                                </div>
                                <div className="form-group">
                                    <input type="email"
                                           className={ classnames ( 'form-control form-control-lg',
                                               { 'is-invalid' : errors.email } ) }
                                           placeholder="Email Address"
                                           onChange={ this.onChange } value={ this.state.email } name="email"/>
                                    <small className="form-text text-muted">This site uses Gravatar so if you want a
                                        profile image, use a
                                        Gravatar email
                                    </small>
                                    { errors.email && ( <div className='invalid-feedback'>{ errors.email }</div> ) }
                                </div>
                                <div className="form-group">
                                    <input type="password"
                                           className={ classnames ( 'form-control form-control-lg',
                                               { 'is-invalid' : errors.password } ) }
                                           placeholder="Password"
                                           onChange={ this.onChange } value={ this.state.password } name="password"/>
                                    { errors.password && (
                                        <div className='invalid-feedback'>{ errors.password }</div> ) }
                                </div>
                                <div className="form-group">
                                    <input type="password"
                                           className={ classnames ( 'form-control form-control-lg',
                                               { 'is-invalid' : errors.password2 } ) }
                                           placeholder="Confirm Password"
                                           onChange={ this.onChange } value={ this.state.password2 } name="password2"/>
                                    { errors.password2 && (
                                        <div className='invalid-feedback'>{ errors.password2 }</div> ) }
                                </div>
                                <input type="submit" className="btn btn-info btn-block mt-4"/>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Register;


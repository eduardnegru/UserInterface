import React, { Component } from 'react';
import logo from './logo.png';
import './Login.css';
import axios from 'axios';
const qs = require('qs');

class Button extends React.Component {


	async handleSignup() {

		let requestBody;

		requestBody = {
			email: this.props.parentState["login-body-email"],
			password: this.props.parentState["login-body-password"],
			firstname: this.props.parentState["login-body-firstname"],
			lastname: this.props.parentState["login-body-lastname"]
		}

		const config = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Access-Control-Allow-Origin': '*'
			}
		}


		try {
			let result = await axios.post("http://localhost:3001/signup", qs.stringify(requestBody), config);
			console.log(requestBody);
			console.log(result);
			window.location="/dashboard";
		} catch (error) {
			console.log(error);
		}
	}

	async handleLogin() {
		let requestBody;

		requestBody = {
			email: this.props.parentState["login-header-email"],
			password: this.props.parentState["login-header-password"]
		}

		const config = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Access-Control-Allow-Origin': '*'
			}
		}

		console.log(requestBody);

		try
		{
			let result = await axios.post("http://localhost:3001/login", qs.stringify(requestBody), config);
			let jwt = result.data.token;
			window.location="/dashboard";
		}
		catch(error)
		{
			console.log(error.message);
		}

	}

	async handleLoginClick(event){



		if(this.props.type === "signup") {

			this.handleSignup();

		}
		else if(this.props.type === "login"){

			this.handleLogin();

		}

	}

    render() {
		return (
			<div>
				<button type="button" onClick={(e) => {this.handleLoginClick(e)}} className={this.props.className}> {this.props.name} </button>
			</div>
		);
  	}
}


class TextInput extends React.Component {


	updateParentState() {
		this.props.handleInputEvent({[this.props.refs] : this.refs[this.props.refs].value});
	}

	render() {

		let strInputSizeClass = "form-group col-lg-";

		if(this.props.size)
		{
			strInputSizeClass += this.props.size;
		}
		else
		{
			strInputSizeClass += "2";	//by default give a size of 2.
		}

		return (
			<div className={strInputSizeClass}>
				<input type={this.props.type} placeholder={this.props.placeholder} onChange={this.updateParentState.bind(this)} ref={this.props.refs} className="form-control"/>
			</div>
		);
	}
}

class Logo extends React.Component {

	render() {
		return (
			<div>
				<img src={logo} alt={this.props.alt} width="150px" height="100px"/>
			</div>
		);
	}
  }


class LoginHeader extends Component{

	async handleInputEvent(data) {
		try {
			await this.setState(data);
		}
		catch(error) {
			console.log(error);
		}
	}

	render() {
		return (
			<div className="login-header">
				<Logo alt="Company Logo"/>
				<TextInput type="text" placeholder="Email" handleInputEvent={this.handleInputEvent.bind(this)} refs="login-header-email"/>
				<TextInput type="password" placeholder="Password" handleInputEvent={this.handleInputEvent.bind(this)} refs="login-header-password"/>
				<Button className="btn login-button" name="Login" parentState={this.state} type="login"/>
			</div>
		);
	  }
}

class Text extends Component{

	render() {
		if(this.props.type === "span")
		{
			return (
				<span>{this.props.innerText}</span>
			);
		}
		else if(this.props.type === "h2")
		{
			return (
				<h2>{this.props.innerText}</h2>
			);
		}
	  }
}

class LoginBody extends Component{

	constructor(){
		super();
		this.state = {};
	}

	async handleInputEvent(data)
	{
		try
		{
			await this.setState(data);
		}
		catch(error)
		{
			console.log(error);
		}
 	}

	render() {
		return (
			<div className = "input-center">
				<div className="body">
					<Text type="h2" innerText="Create a new Account"/>
					<Text type="span" innerText="It's free and it only takes a few seconds"/>
					<div className="inline">
						<TextInput type="text" placeholder="First Name" handleInputEvent={this.handleInputEvent.bind(this)} refs="login-body-firstname"/>
						<TextInput type="text" placeholder="Last Name" handleInputEvent={this.handleInputEvent.bind(this)} refs="login-body-lastname"/>
					</div>
					<div className="input-center">
						<TextInput type="text" placeholder="Email" size={4} handleInputEvent={this.handleInputEvent.bind(this)} refs="login-body-email"/>
						<TextInput type="password" placeholder="Password" size={4} handleInputEvent={this.handleInputEvent.bind(this)} refs="login-body-password"/>
						<Button className="btn create-account-button" name="Create Account" parentState={this.state} type="signup"/>
					</div>
				</div>
			</div>
		);
	  }
}

class Login extends Component {
  render() {
	return (
		<div className="LoginPage">
			<LoginHeader/>
			<LoginBody/>
		</div>
	);
  }
}

export default Login;

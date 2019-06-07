import React, { Component } from 'react';
import Login from './Login.js';
import Dashboard from './Dashboard.js';
import './Dashboard.css';
import './Login.css';
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<Switch>
					<Route path="/login" component={Login}/>
					<Route path="/dashboard" component={Dashboard}/>
					<Route path="/" component={Login}/>
				</Switch>
			</BrowserRouter>
		);
	}
}

export default App;

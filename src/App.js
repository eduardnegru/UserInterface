import React, { Component } from 'react';
import Login from './Login.js';
import Dashboard from './Dashboard.js';
import './Dashboard.css';
import './Login.css';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

class App extends Component {
	render() {
		return (
			<Router>
				<div>
					<Route path="/login" component={Login}/>
					<Route path="/dashboard" component={Dashboard}/>
				</div>
			</Router>
		);
	}
}

export default App;

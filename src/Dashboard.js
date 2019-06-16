import React, { Component } from 'react';
import SocketSingleton from './Socket';
import './Dashboard.css';
import Chart from 'chart.js';
import axios from 'axios';
import randomColor from 'randomcolor';
import WordCloud from 'react-d3-cloud';
import io from 'socket.io-client';
import ClipLoader from 'react-spinners/ClipLoader';
import sleep from "sleep-promise";
import Cookies from 'js-cookie';
import ReactDOM from 'react-dom';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
const qs = require('qs');

// const socket = require('./Socket');

const ignoredKeys = ["Tab", "CapsLock", "Shift", "Control", "Alt", "AltGraph", "Escape", "F1"];

class CustomWordCloud extends Component
{
	constructor(props)
	{
		super(props);
	}

	render() {
		const data = this.props.data.map(function(x){
			return {
				value: x["count"],
				text: x["train_ngram_text"]
			}
		});

		  const fontSizeMapper = word => Math.log2(word.value) * this.props.font;

		return(
			<div>
				<div className="word-cloud-title">
					<span>{this.props.title}</span>
				</div>
				<WordCloud data={data} fontSizeMapper={fontSizeMapper} rotate = {0} width={600} height={400}/>
			</div>
		);
	}

}

class SideBarOption extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			isExpanded: false,
			optionClicked: ""
		};
	}

	async onClickListener()
	{
		if(this.props.isExpandable)
		{
			await this.setState({isExpanded: !this.state.isExpanded});
		}
		await this.props.handleOptionClicked(this.props.id);
	}

	render() {

		let arrCards = [];
		let arrOptions;
		if(this.state.isExpanded && this.props.isExpandable)
		{
			if(this.props.id === "training-dataset")
			{
				arrOptions = [
					{
						image: "fas fa-chart-pie classification-image",
						text: "Classification",
						id: "training-dataset-classification"
					},
					{
						image: "fas fa-chart-bar ngram-image",
						text: "N-grams",
						id: "training-dataset-ngram"
					},
					{
						image: "fas fa-cloud word-cloud-image",
						text: "Word cloud",
						id: "training-dataset-word-cloud"
					}
				]
			}
			else if(this.props.id === "messages-classification")
			{
				arrOptions = [
					{
						image: "fas fa-cog data-sources",
						text: "Data sources",
						id: "data-sources"
					},
					{
						image: "fas fa-frown messages-toxic",
						text: "Toxic",
						id: "messages-toxic"
					},
					{
						image: "fas fa-grin-beam messages-not-toxic",
						text: "Non-toxic",
						id: "messages-not-toxic"
					}
				]
			}
			else if(this.props.id === "playground")
			{
				arrOptions = [];
			}

			for(let i = 0; i < arrOptions.length; i ++)
			{
				arrCards.push(<SideBarOption handleOptionClicked={this.props.handleOptionClicked} id={arrOptions[i].id} isExpandable={false} innerText={arrOptions[i].text} image={arrOptions[i].image}></SideBarOption>);
			}
		}

		return (
			<div className="side-bar-option-wrapper">
				<div onClick={this.onClickListener.bind(this)} className="side-bar-option">
					<div className="side-bar-option-image">
						<i className={this.props.image}></i>
					</div>
					<div className="side-bar-option-text-wrapper">
						<span className="side-bar-option-text">{this.props.innerText}</span>
					</div>
					{
						<div className="side-bar-option-expand">
							{
								!this.props.isExpandable && <i></i>
								|| this.state.isExpanded === false && <i className="fas fa-sort-down"></i>
								|| this.state.isExpanded === true && <i className="fas fa-sort-up side-bar-option-expand-image"></i>
							}

						</div>
					}
				</div>
				{
					this.state.isExpanded === true &&
					arrCards
				}
			</div>

		);
	}
}

class TopBar extends Component {
	constructor(props)
	{
		super(props);
	}

	onHomeClicked()
	{
		window.location.reload();
	}

	render() {
		let email = sessionStorage.getItem("email");
		return(
			<div className="top-bar">
				<h1 className="company-name" onClick={this.onHomeClicked.bind(this)}>{"Dashboard"}</h1>
				<span className="logged-in-user">{"Welcome, " + email + "."}</span>
			</div>
		);
	}
}

class SideBar extends Component {

	constructor(props) {

		super(props);
		this.state={
			optionClicked:""
		};
	}

	async handleOptionClicked(strOptionClikced) {
		let data = null;

		if(
			strOptionClikced === "messages-toxic"
			|| strOptionClikced === "messages-not-toxic"
		)
		{
			const jwtToken = Cookies.get('jwt');

			const config = {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Access-Control-Allow-Origin': '*',
					'Authorization': 'Bearer '+ jwtToken
				}
			}

			let isToxic = strOptionClikced.split("-")[1] === "toxic" ? 1 : 0;

			try
			{
				data = await axios.get("http://localhost:3001/messages_get?isToxic="+isToxic, {}, config);
			}
			catch(error)
			{
				console.log(error.message);
			}
		}

		await this.props.handleOptionClicked(strOptionClikced, data);
	}

	render() {

		let arrCards = [];
		let arrOptions = [
			{
				image: "fas fa-gamepad playground-icon",
				text: "Playground",
				id: "playground",
				isExpandable: false
			},
			{
				image: "fas fa-database training-dataset-image",
				text: "Training dataset",
				id: "training-dataset",
				isExpandable: true
			},
			{
				image: "fas fa-sync messages-classification",
				text: "Real-time data",
				id: "messages-classification",
				isExpandable: true
			}
		]

		for(let i = 0; i < arrOptions.length; i ++)
		{
			arrCards.push(<SideBarOption handleOptionClicked={this.handleOptionClicked.bind(this)} id={arrOptions[i].id} isExpandable={arrOptions[i].isExpandable} innerText={arrOptions[i].text} image={arrOptions[i].image}/>);
		}

		return (
			<div className="side-bar">
				<div className="side-bar-cards">
					{arrCards}
				</div>
			</div>

		);
	}
}

class SideBarShadow extends Component {
	constructor(props)
	{
		super(props);
	}

	render() {
		return (
			<div className="side-bar-shadow">
			</div>

		);
	}
}

class MessageWrapper extends Component {

	constructor(props)
	{
		super(props);
	}

	render() {
		return (
			<div className="message-wrapper">
				<div className="message-holder">
					<div>
						{
							this.props.source === "training_dataset" && <i className="fab fa-quora logo-quora"></i>
							|| this.props.source === "twitter" && <i className="fab fa-twitter logo-twitter"></i>
							|| this.props.source === "speech_to_text" && <i className="fas fa-microphone logo-microphone"></i>
						}
					</div>
					<div className="message-text">
						<span>{this.props.text}</span>
					</div>
					<div className="message-score">
						<span>{"Score: " + parseFloat(this.props.score).toFixed(4)}</span>
					</div>
				</div>
			</div>
		);
	}
}

class MainContent extends Component
{
	constructor(props)
	{
		super(props);
		let dataSources = ["twitter", "speech_to_text", "training_dataset"];
		let strInputValue = sessionStorage.getItem("inputValue");
		let arrSettings;

		if(strInputValue === null)
		{
			arrSettings = null;
		}
		else
		{
			arrSettings = [];

			for(let i = 0; i < dataSources.length; i++)
			{
				let bCheckBoxChecked = sessionStorage.getItem(dataSources[i]);
				if(bCheckBoxChecked === null)
				{
					arrSettings = null;
					break;
				}

				let bValue = bCheckBoxChecked === "true" ? true : false;
				let objSetting = {
					"dataSourceName": dataSources[i],
					"isRunning": bValue
				}

				arrSettings.push(objSetting);
			}
		}

		this.state = {"toxic_page": 1, "non_toxic_page": 1, "arrSettings": arrSettings ? arrSettings : null, "strInputValue": strInputValue ? strInputValue : "Romania"};

		this.nMessagesPerPage = 5;
	}

	async onToxicPageChange(page)
	{
		await this.setState({"toxic_page": page});
	}

	async onNonToxicPageChange(page)
	{
		await this.setState({"non_toxic_page": page});
	}

	async onDataSourceChange(arrSettings, strInputValue)
	{
		await this.setState({"arrSettings": arrSettings});
		await this.setState({"strInputValue": strInputValue});
		sessionStorage.setItem("inputValue", strInputValue);

		for(let nIndex in arrSettings)
		{
			sessionStorage.setItem(arrSettings[nIndex]["dataSourceName"], arrSettings[nIndex]["isRunning"]);
		}

	}

	async componentDidMount()
	{
		const jwtToken = Cookies.get('jwt');

		const config = {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Authorization': 'Bearer '+ jwtToken,
			}
		}

		try
		{
			let result = await axios.get("http://localhost:3001/training_data_statistics", {}, config);
			await this.setState(result.data.message);
		}
		catch(error)
		{
			console.log(error.message);
		}
	}

	render()
	{

		if(Object.keys(this.state).length !== 0)
		{
			let elNode = {};

			if(this.props.optionClicked === "training-dataset-ngram")
			{
				elNode = <div className="main-content">
									<BarChart parentState={this.state} type="1gram_not_toxic" label="1-gram not toxic count"/>
									<BarChart parentState={this.state} type="1gram_toxic" label="1-gram toxic count"/>
									<BarChart parentState={this.state} type="2gram_not_toxic" label="2-gram not toxic count"/>
									<BarChart parentState={this.state} type="2gram_toxic" label="2-gram toxic count"/>
									<BarChart parentState={this.state} type="3gram_not_toxic" label="3-gram not toxic count"/>
									<BarChart parentState={this.state} type="3gram_toxic" label="3-gram toxic count"/>
									<BarChart parentState={this.state} type="4gram_not_toxic" label="4-gram not toxic count"/>
									<BarChart parentState={this.state} type="4gram_toxic" label="4-gram toxic count"/>
								</div>
			}
			else if(this.props.optionClicked === "training-dataset-classification")
			{
				elNode = <div className="main-content">
							<PieChart parentState={this.state} type="toxicity_count"/>
						 </div>
			}
			else if(this.props.optionClicked === "training-dataset-word-cloud")
			{

					let arrOptions = [
						{
							"filename": "1gram_not_toxic",
							"title": "1-gram not toxic",
							"fontSize": 2
						},
						{
							"filename": "1gram_toxic",
							"title": "1-gram toxic",
							"fontSize": 2
						},
						{
							"filename": "2gram_not_toxic",
							"title": "2-gram not toxic",
							"fontSize": 3
						},
						{
							"filename": "2gram_toxic",
							"title": "2-gram toxic",
							"fontSize": 3
						},
						{
							"filename": "3gram_not_toxic",
							"title": "3-gram not toxic",
							"fontSize": 4
						},
						{
							"filename": "3gram_toxic",
							"title": "3-gram toxic",
							"fontSize": 4
						},
						{
							"filename": "4gram_not_toxic",
							"title": "4-gram not toxic",
							"fontSize": 3
						},
						{
							"filename": "4gram_toxic",
							"title": "4-gram toxic",
							"fontSize": 6
						}
					]
					let arrNodes = [];

					for(let i = 0; i < arrOptions.length; i+=2)
					{
						arrNodes.push(
							<div className="word-cloud-row-wrapper">
								<div className="word-cloud-wrapper">
									<CustomWordCloud data={this.state[arrOptions[i].filename]} title={arrOptions[i].title} font={arrOptions[i].fontSize}/>
								</div>
								<div className="word-cloud-wrapper">
									<CustomWordCloud data={this.state[arrOptions[i + 1].filename]} title={arrOptions[i + 1].title} font={arrOptions[i + 1].fontSize}/>
								</div>
							</div>
						);
					}

					elNode = <div className="main-content-word-cloud">
								{arrNodes}
							</div>
			}
			else if(this.props.optionClicked === "messages-toxic")
			{
				let arrMessages = this.props.data.data;
				let nCurrentPage = this.state["toxic_page"];
				let arrMessagesWrapper = [];
				let nPagesRequired = arrMessages.length / this.nMessagesPerPage;
				let arrMessagesSliced = arrMessages.slice((nCurrentPage - 1) * this.nMessagesPerPage, (nCurrentPage - 1) * this.nMessagesPerPage + this.nMessagesPerPage);
				console.log(arrMessages);
				console.log(arrMessagesSliced);
				for(let i = 0; i < arrMessagesSliced.length; i++)
				{
					if(arrMessagesSliced[i].message_text && arrMessagesSliced[i].length != 0)
					{
						arrMessagesWrapper.push(<MessageWrapper text={arrMessagesSliced[i].message_text} source={arrMessagesSliced[i].message_source} score={arrMessagesSliced[i].message_is_toxic}/>);
					}
				}
				arrMessagesWrapper.push(
					<div className="pagination">
						<Pagination onChange={this.onToxicPageChange.bind(this)} current={this.state["toxic_page"]} defaultPageSize={5} total={arrMessages.length}/>
					</div>
				);
				elNode = <div className="message-box">{this.state.toxicMessages}</div>
				elNode = <div className="message-box">{arrMessagesWrapper}</div>
			}
			else if(this.props.optionClicked === "messages-not-toxic")
			{
				let arrMessages = this.props.data.data;
				let nCurrentPage = this.state["non_toxic_page"];
				let arrMessagesWrapper = [];
				let nPagesRequired = arrMessages.length / this.nMessagesPerPage;
				let arrMessagesSliced = arrMessages.slice((nCurrentPage - 1) * this.nMessagesPerPage, (nCurrentPage - 1) * this.nMessagesPerPage + this.nMessagesPerPage);

				for(let i = 0; i < arrMessagesSliced.length; i++)
				{
					if(arrMessagesSliced[i].message_text && arrMessagesSliced[i].length != 0)
					{
						arrMessagesWrapper.push(<MessageWrapper text={arrMessagesSliced[i].message_text} source={arrMessagesSliced[i].message_source} score={arrMessagesSliced[i].message_is_toxic}/>);
					}
				}
				arrMessagesWrapper.push(
					<div className="pagination">
						<Pagination onChange={this.onNonToxicPageChange.bind(this)} current={this.state["non_toxic_page"]} defaultPageSize={5} total={arrMessages.length}/>
					</div>
				);
				elNode = <div className="message-box">{this.state.toxicMessages}</div>
				elNode = <div className="message-box">{arrMessagesWrapper}</div>
			}
			else if(this.props.optionClicked === "data-sources")
			{
				elNode = <div className="data-main-content">
							<p class="settings-top-margin">Configure data sources for the Kafka cluster.</p>
							<DataSourceSettings onDataSourceChange={this.onDataSourceChange.bind(this)} settings={this.state.arrSettings} inputValue={this.state.strInputValue}/>
						</div>
			}
			else if(this.props.optionClicked === "playground")
			{
				elNode = <div className="data-main-content">
							<Playground/>
						</div>
			}
			else
			{
				elNode = <div className="data-main-content">
							<Playground/>
						</div>
			}

			return (elNode)
		}
		else
		{
			return(

				<div>
					<h1>Loading...</h1>
				</div>
			)
		}
	}
}

class MainBody extends Component {
	constructor(props) {
		super(props);

		this.state={
			optionClicked: ""
		};
	}

	async handleOptionClicked(strOptionClikced, data) {
		await this.setState({optionClicked: strOptionClikced, data: data});
	}

	render() {

		return(
			<div className="main-body">
				<SideBar handleOptionClicked={this.handleOptionClicked.bind(this)}/>
				<SideBarShadow/>
				<MainContent optionClicked={this.state.optionClicked} data={this.state.data}/>
			</div>
		)
	}
}

class BarChart extends React.Component {

	constructor(props)
	{
		super(props);
	}

	componentDidMount()
	{
		const node = this.node;

		let arrData = this.props.parentState[this.props.type];

		var myChart = new Chart(node, {
			type: "horizontalBar",
			data: {
				labels: arrData.map(x => x["train_ngram_text"]),
				datasets: [{
						label: this.props.label,
						data: arrData.map(x => x["count"]),
						backgroundColor: arrData.map(x => randomColor({luminosity: "bright"}))
				}]
			}
		});
	}

	render() {
		return (
			<div className="chart-wrapper">
				<canvas className="pie-chart" ref={node => (this.node = node)}/>
			</div>
	  );
	}
}

class Checkbox extends React.Component {

	constructor(props)
	{
		super(props);
		this.checked = (this.props.isChecked === false || this.props.isChecked === undefined) ? false : true;
	}

	async onCheckboxChange(e)
	{
		this.checked = !this.checked;
		this.props.onChange(this.props.type, this.checked);
		this.forceUpdate();
	}

	render() {

		let logo = {};

		if(this.props.type === "twitter")
		{
			logo = {color: "#1da1f2"};
		}
		else if(this.props.type === "training_dataset")
		{
			logo = {color: "#b92a26"};
		}

		logo["font-size"] = "2rem";

		return (
			<div class="settings-inline">
				<div>
					<input type="checkbox" id="gridCheck1" onChange={e => this.onCheckboxChange(e)} checked={this.checked}/>
					<i style={logo} className={this.props.logo}></i>
					<label className="settings-label" for="gridCheck1">
					{this.props.text}
					</label>
				</div>
			</div>
		);
	}
}

class Playground extends Component {

	constructor(props)
	{
		super(props);
		this.timer = null;
		this.state = {"count": 0, "status": "stall", "message": "", "inputMessage":""};
	}

	async onKeyUp(event)
	{
		if(!ignoredKeys.includes(event.key))
		{
			if(this.timer)
			{
				clearInterval(this.timer);
			}

			let letterCount = event.target.value === "" ? 0 : event.target.value.length;
			this.timer = setInterval(this.doneTyping.bind(this), 800);
			await this.setState({"count" : letterCount, "status":"loading", "message": "", "inputMessage":event.target.value.trim()});
		}
	}

	async doneTyping()
	{
		if(this.timer)
		{
			clearInterval(this.timer);
		}

		// const requestBody = {"text": "the"};

		if(this.state.inputMessage.length === 0)
		{
			await this.setState({"status": "stall", "message": ""});
			return;
		}

		console.log("sending", this.state.inputMessage.replace(/[^0-9a-zA-Z ]/g, "").replace(/\s\s+/g, ' ').trim());

		let bodyFormData = new FormData();
		bodyFormData.append("text", "the");

		const response = await axios({
			method: "POST",
			url: "http://35.231.178.30:8000/predict",
			headers: {
			  	"Content-Type": "application/x-www-form-urlencoded"
			},
			data: {
			   text: this.state.inputMessage.replace(/[^0-9a-zA-Z ]/g, "").replace(/\s\s+/g, ' ').trim()
			}
		});


		let prediction = response.data.prediction;
		let status;
		let message;

		if(prediction < 0.4)
		{
			status = "non-toxic";
			message = "Unlikely to be perceived as toxic (" + prediction + ")";
		}
		else if(prediction < 0.5)
		{
			status = "non-toxic";
			message = "Unsure if this will be perceived as toxic (" + prediction + ")";
		}
		else if(prediction < 0.6)
		{
			status = "toxic";
			message = "Unsure if this will be perceived as toxic (" + prediction + ")";
		}
		else if(prediction < 0.8)
		{
			status = "toxic";
			message = "Likely to be perceived as toxic (" + prediction + ")";
		}
		else
		{
			status = "toxic";
			message = "Very likely to be perceived as toxic (" + prediction + ")";
		}

		await this.setState({"status": status, "message": message});
 	}

	render() {

		return (
			<div class="form-group form-wrapper-text">
				<label class="playground-label" for="exampleFormControlTextarea6">Type a message and wait for the toxicity results.</label>
				<div class="playground-content">
					<div class="playground-status">
						<StatusCircle status={this.state.status}/>
						<Label className="playground-status-message" text={this.state.message}/>
					</div>
					<textarea maxLength={500} class="z-depth-1 input-text" id="exampleFormControlTextarea6" rows="3" placeholder="Write something here..." onKeyUp={e => this.onKeyUp(e)}></textarea>
					<Label className="playground-count-label" text={"Characters " + this.state.count + "/500"}/>
				</div>
			</div>
		);
	}
}

class StatusCircle extends React.Component
{
	constructor(props) {
		super(props);
	}

	render() {
		if(this.props.status === "stall")
		{
			return (
				<div class="playground-status-circle-stall">
					<i class="fas fa-circle"></i>
				</div>

			)
		}
		else if(this.props.status === "toxic")
		{
			return (
				<div class="playground-status-circle-toxic">
					<i class="fas fa-circle playground-status-circle-toxic"></i>
				</div>
			)
		}
		else if(this.props.status === "non-toxic")
		{
			return (
				<div class="playground-status-circle-non-toxic">
					<i class="fas fa-circle"></i>
				</div>

			)
		}
		else if(this.props.status === "loading")
		{
			return (
				<Spinner class="playground-status-circle-loading" unit="rem" size="1" isLoading={true}/>
			)
		}
	}
}

class Label extends React.Component
{
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<span class={this.props.className}> {this.props.text}</span>
		)
	}
}

class DataSourceSettings extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {"isLoading": false};
		this.objDataSourcesStatus = {};
		this.inputValue = this.props.inputValue;

		if(this.props.settings)
		{
			for(let i = 0; i < this.props.settings.length; i++)
			{
				this.objDataSourcesStatus[this.props.settings[i]["dataSourceName"]] = this.props.settings[i]["isRunning"];
			}
		}
		else
		{
			let dataSources = ["twitter", "speech_to_text", "training_dataset"];
			for(let i = 0; i < dataSources.length; i++)
			{
				this.objDataSourcesStatus[dataSources[i]] = true;
			}
		}

		// console.log(this.objDataSourcesStatus);

	}

	async saveSetttingsListener()
	{
		let arrSettings = []

		await this.setState({"isLoading": true});

		try
		{
			let socket =  SocketSingleton.get();
			await sleep(1000);
			let dataSources = ["twitter", "speech_to_text", "training_dataset"];

			for(let dataSourceName of dataSources)
			{
				let objData = {"dataSourceName": dataSourceName, "isRunning": this.objDataSourcesStatus[dataSourceName]};
				if(dataSourceName === "twitter" && this.objDataSourcesStatus[dataSourceName] === true)
				{
					objData["tag"] = this.inputValue;
				}
				arrSettings.push(objData);
			}

			socket.send(JSON.stringify(arrSettings));
			await this.props.onDataSourceChange(arrSettings, this.inputValue);
			await this.setState({"isLoading": false});
		}
		catch(error)
		{
			console.log(error);
			await this.setState({"isLoading": false});
		}
	}

	async handleCheckboxChange(type, value)
	{
		this.objDataSourcesStatus[type] = value;
		// console.log(this.objDataSourcesStatus);
	}

	async handleInputChange(event)
	{
		this.inputValue = event.target.value;
		this.forceUpdate();
	}

	render() {

		let buttonColor = {
			background: "#3b4cab",
			color: "white",
			marginLeft: "5rem"
		};

		return (

		  <div>
			<Checkbox isChecked={this.objDataSourcesStatus["twitter"]} text="Real-time Tweets" type="twitter" logo="fab fa-twitter left-margin" onChange={this.handleCheckboxChange.bind(this)}/>
			<br/>
			<Checkbox isChecked={this.objDataSourcesStatus["training_dataset"]} text="Quora" type="training_dataset" logo="fab fa-quora left-margin" onChange={this.handleCheckboxChange.bind(this)}/>
			<br/>
			<Checkbox isChecked={this.objDataSourcesStatus["speech_to_text"]} text="Google speech to text" type="speech_to_text" logo="fas fa-microphone left-margin" onChange={this.handleCheckboxChange.bind(this)}/>
			<br/>
			<br/>
			<input type="text" className="form-control" placeholder="Enter Twiter tag filter" value={this.inputValue} onChange={this.handleInputChange.bind(this)}></input>
			<br/>
			{/* <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com"/> */}
			{/* <button style={buttonColor} class="btn create-account-button" type="button">Save settings</button> */}
			<button onClick={this.saveSetttingsListener.bind(this)} style={buttonColor} class="btn create-account-button" type="button">Save settings</button>
			<br/>
			<br/>
			<Spinner class="sweet-loading spinner-config" unit="px" size="50" isLoading={this.state["isLoading"]}/>
		  </div>
	  );
	}
}

class Spinner extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		loading: false
	  }
	}

	render() {
	  return (
		<div className={this.props.class}>
		  <ClipLoader
			sizeUnit={this.props.unit}
			size={this.props.size}
			color={'#123abc'}
			loading={this.props.isLoading}
		  />
		</div>
	  )
	}
}

class PieChart extends React.Component {

	constructor(props)
	{
		super(props);
	}

	componentDidMount()
	{
	  const node = this.node;

	  let objData = this.props.parentState[this.props.type];

	  var myChart = new Chart(node, {
		type: "pie",
		data: {
		  labels: Object.keys(objData),
		  datasets: [
			{
			  data: Object.values(objData),
			  backgroundColor: [randomColor({luminosity: 'dark'}), randomColor({luminosity: 'light'})]
			}
		  ]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	  });
	}

	render() {
	  return (
		  <div className="pie-chart-wrapper">
			<canvas className="pie-chart" ref={node => (this.node = node)}/>
		  </div>

	  );
	}
}

class Dashboard extends Component {

	constructor(props)
	{
		super(props);
	}

	render() {
		return (
			<div className="dashboard-wrapper">
				<TopBar/>
				<MainBody/>
			</div>
		);
	}
}

export default Dashboard;

import React, { Component } from 'react';
import './Dashboard.css';
import Chart from 'chart.js';
import axios from 'axios';
import randomColor from 'randomcolor';
import WordCloud from 'react-d3-cloud';
import io from 'socket.io-client';

class CustomWordCloud extends Component
{
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
    constructor()
    {
        super();
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
                        image: "fas fa-frown messages-toxic",
                        text: "Toxic messages",
                        id: "messages-toxic"            
                    },
                    {
                        image: "fas fa-grin-beam messages-not-toxic",
                        text: "Non-toxic messages",
                        id: "messages-not-toxic"
                    }
                ]
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
                        this.props.isExpandable &&
                        
                        <div className="side-bar-option-expand">
                            {
                                this.state.isExpanded === false &&
                                <i className="fas fa-sort-down"></i>
                                || this.state.isExpanded === true &&
                                    <i className="fas fa-sort-up side-bar-option-expand-image"></i>
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
    render() {
        return(
            <div className="top-bar">
                <h1 className="company-name">{"Classify toxic messages in real time"}</h1>
                <span className="logged-in-user">{"adrianeduardnegru@gmail.com"}</span>
            </div>   
        );
    }
}

class SideBar extends Component {

    constructor() {
        
        super();
        this.state={
            optionClicked:""
        };
    }

    async handleOptionClicked(strOptionClikced) {
        await this.props.handleOptionClicked(strOptionClikced);
    }

    render() {

        let arrCards = [];
        let arrOptions = [
            {
                image: "fas fa-database training-dataset-image",
                text: "Training dataset",
                id: "training-dataset",
            },
            {
                image: "fas fa-sync messages-classification",
                text: "Real-time data",
                id: "messages-classification"
            }
        ]

        for(let i = 0; i < arrOptions.length; i ++)
        {
            arrCards.push(<SideBarOption handleOptionClicked={this.handleOptionClicked.bind(this)} id={arrOptions[i].id} isExpandable={true} innerText={arrOptions[i].text} image={arrOptions[i].image}/>);
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

    render() {        
        return (
            <div className="side-bar-shadow">                          
            </div>
            
        );
    }
}

class MessageWrapper extends Component {

    render() {        
        return (
            <div className="message-wrapper">
                <div className="message-holder">
                    <div>
                        {
                            this.props.source === "quora" && <i className="fab fa-quora logo-quora"></i>
                            || this.props.source === "twitter" && <i className="fab fa-twitter logo-twitter"></i>
                        }
                    </div>
                    <div className="message-text">
                        <span>{this.props.text}</span>
                    </div>
                </div>                
            </div>            
        );
    }
}

class MainContent extends Component
{
    
    constructor()
    {
        super();

        this.socket = io('http://localhost:3001');
        
        this.state = {};
        this.incomingNotToxicMessages = false;
        this.incomingToxicMessages = false;
    }

    async componentDidMount()
    {

        const config = {
			headers: {
				'Access-Control-Allow-Origin': '*'
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
                let arrMessages = [];
                // this.socket.emit("not_toxic_end");
                if(this.incomingNotToxicMessages)
                {
                    this.socket.emit("not_toxic_end");
                }
                
                if(!this.incomingToxicMessages)
                {
                    this.socket.emit("toxic", Math.round((new Date()).getTime() / 1000));
                    this.socket.on("toxic_data", async (data) => {

                        for(let i = 0; i < data.length; i++)
                        {
                            arrMessages.push(<MessageWrapper text={data[i].message_text} source="quora"/>);
                        }                        

                        this.incomingToxicMessages = true;
                        this.incomingNotToxicMessages = false;
                        await this.setState({"toxicMessages": arrMessages});                        
                    });
                }
                
                elNode = <div className="message-box">{this.state.toxicMessages}</div>
                
            }
            else if(this.props.optionClicked === "messages-not-toxic") 
            {
                let arrMessages = [];
                // this.socket.emit("toxic_end");
                if(this.incomingToxicMessages)
                {
                    this.socket.emit("toxic_end");
                }
                
                if(!this.incomingNotToxicMessages)
                {
                    this.socket.emit("not_toxic", Math.round((new Date()).getTime() / 1000));
                    this.socket.on("not_toxic_data", async (data) => {
                        console.log(data);
                        for(let i = 0; i < data.length; i++)
                        {
                            arrMessages.push(<MessageWrapper text={data[i].message_text} source="quora"/>);
                        }                        
                        this.incomingNotToxicMessages = true;
                        this.incomingToxicMessages = false;
                        await this.setState({"notToxicMessages": arrMessages});                        
                    });
                }

                elNode = <div className="message-box">{this.state.notToxicMessages}</div>

            }
            else
            {
                if(this.incomingToxicMessages)
                {
                    this.socket.emit("toxic_end");
                    this.incomingToxicMessages = false;            
                }
                
                if(this.incomingNotToxicMessages)
                {
                    this.socket.emit("not_toxic_end");
                    this.incomingNotToxicMessages = false;                
                }

                elNode = <div className="main-content"></div>
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
    constructor() {
        super();
        
        this.state={
            optionClicked: ""
        };
    }

    async handleOptionClicked(strOptionClikced) {
        await this.setState({optionClicked: strOptionClikced});
    } 

    render() {

        return(
            <div className="main-body">
                <SideBar handleOptionClicked={this.handleOptionClicked.bind(this)}/>                
                <SideBarShadow/>
                <MainContent optionClicked={this.state.optionClicked}/>
            </div>
        )
    }
}

class BarChart extends React.Component {

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


class LineChart extends React.Component {
    componentDidMount() 
    {
      const node = this.node;

      var myChart = new Chart(node, {
        type: "line",
        data: {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [
                {
                    label: "Total visitors",
                    fill: false,
                    lineTension: 0,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: [65, 59, 80, 81, 56, 55, 40],
                    spanGaps: false,
                }
            ]
        },
        options: {
            lineTension: 0
        }
      });
    }
  
    render() {
      return (
          <canvas
            className="pie-chart"
            ref={node => (this.node = node)}
          />
      );
    }
}

class PieChart extends React.Component {
    
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
              backgroundColor: randomColor({count: 2})
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

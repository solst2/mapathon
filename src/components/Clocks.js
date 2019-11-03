import React from "react";

export default class Clocks extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            date: new Date()
        };

        this.updateDate = this.updateDate.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(this.updateDate, 1000);
    }

    updateDate() {
        this.setState({
            date: new Date()
        });
    }

    render() {
        return (
            <div >
                <div >{this.props.name}</div>
                <div className="items">
                    <Clock name="Local Time:" date={this.state.date} />

                    <Clock
                        name="UK Time:"
                        date={this.state.date}
                        country={"en-GB"}
                        timeZone={"Europe/London"}
                    /> <Clock
                        name="US Time:"
                        date={this.state.date}
                        country={"en-US"}
                        timeZone={"America/New_York"}
                    />
                    <Clock
                        name="NZ Time:"
                        date={this.state.date}
                        country={"en-NZ"}
                        timeZone={"Pacific/Chatham"}
                    />
                </div>
            </div>
        );
    }
}
class Clock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isHidden: true
        };

        this.showClock = this.showClock.bind(this);
    }

    showClock() {
        this.setState({
            isHidden: !this.state.isHidden
        });
    }

    render() {
        return (
            <p className="clock">
                <div className="clock-title">
                    <div className="items header">{this.props.name}</div>
                    {/*<div className={this.state.isHidden ? "dropdownbtn" : "dropdownbtn open"} onClick={this.showClock}></div>*/}
                </div>
                <div className={this.state.isHidden ? "time hide" : "time show"}>
                    {this.props.date.toLocaleTimeString(this.props.country, {
                        timeZone: this.props.timeZone
                    })}
                </div>
            </p>
        );
    }
}



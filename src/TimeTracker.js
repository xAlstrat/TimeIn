import React, { Component } from 'react';
import moment from 'moment';
import 'moment-duration-format';
import Row from "react-bootstrap/es/Row";
import Col from "react-bootstrap/es/Col";
import Button from "react-bootstrap/es/Button";
import Label from "react-bootstrap/es/Label";
import FormGroup from "react-bootstrap/es/FormGroup";
import InputGroup from "react-bootstrap/es/InputGroup";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import Badge from "react-bootstrap/es/Badge";
import Checkbox from "react-bootstrap/es/Checkbox";
export class Chronometer extends Component{
    constructor(props){
        super(props);
        this.state = {
            duration: props.duration,
            startedAt: moment(),
            paused: false,
            started: false,
            countdown: props.countdown?true:false,

        };
        this.onStart = this.props.onStart || ((d)=>d);
        this.onPause = this.props.onPause || ((d)=>d);
        this.onStop = this.props.onStop || ((d)=>d);
        this.onResume = this.props.onResume || ((d)=>d);
        this.onTick = this.props.onTick || ((d)=>d);
        this.onTimeElapsed = this.props.onTimeElapsed || ((d)=>d);
        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
        this.stop = this.stop.bind(this);
        this.forward = this.forward.bind(this);
    }

    render(){
        const running = this.state.started && ! this.state.paused;
        return (<div>
            <div className='text-center'>
                <h2>
                    <Label bsStyle={running?'info':'default'}>{this.state.duration.format("h:mm:ss", {
                        trim: false
                    })}</Label>
                </h2>
            </div>
            <div>
                {!this.state.started?
                    (<Button bsStyle='success'
                             className='form-control play'
                             disabled={
                                 this.state.countdown && this.state.duration.asSeconds() <= 0
                             }
                             onClick={this.start}><Glyphicon glyph="play" /> Iniciar</Button>):
                    (<FormGroup>
                            <InputGroup>
                                {this.state.paused? (
                                        <InputGroup.Button key={1}>
                                            <Button bsStyle='success'
                                                    className='form-control'
                                                    onClick={this.resume}><Glyphicon glyph="play" />
                                            </Button>
                                        </InputGroup.Button>
                                    ):
                                    (<InputGroup.Button key={2}>
                                        <Button bsStyle='warning'
                                                className='form-control'
                                                onClick={this.pause}><Glyphicon glyph="pause" /></Button>
                                    </InputGroup.Button>)}
                                <InputGroup.Button key={3}>
                                    <Button bsStyle='info'
                                            className='form-control'
                                            disabled={!this.props.countdown}
                                            onClick={this.forward}><Glyphicon glyph="fast-forward" /></Button>
                                </InputGroup.Button>
                                <InputGroup.Button key={4}>
                                    <Button bsStyle='danger'
                                            className='form-control'
                                            onClick={this.stop}><Glyphicon glyph="stop" /></Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    )}
            </div>
        </div>);
    }

    componentWillReceiveProps(props){
        if(!this.state.started){
            this.setState({
                countdown: props.countdown?true:false,
                duration: props.duration,
            });
        }
    }

    componentDidMount(){
    }

    componentWillUnmount(){
        clearInterval(this.intervalId);
    }

    timeElapsed(elapsedTimeInSeconds) {
        let duration = null;
        if (!this.state.countdown)
            duration = this.state.duration.add(elapsedTimeInSeconds, 'second');
        else {
            duration = this.state.duration.subtract(elapsedTimeInSeconds, 'second');
            if(duration.asSeconds() <= 0){
                this.stop();
            }
        }
        this.setState({duration: duration}, ()=>this.onTimeElapsed(elapsedTimeInSeconds));
    }

    start(callback){
        this.intervalId = setInterval(()=>{
            if(!this.state.paused){
                this.timeElapsed(1);
                this.onTick(this);
            }
        }, 1000);
        this.setState({started: true}, this.onStart);
    }

    reset(){
        clearInterval(this.intervalId);
        this.setState(
            {
                startedAt: moment(),
                paused: false,
                started: false,
                duration: !this.state.countdown?
                    this.state.duration.subtract(this.state.duration):
                    this.state.duration.add(this.props.targetDuration.clone().subtract(this.state.duration)),
            }
        );
    }

    pause(runCallback){
        this.setState({paused:true}, ()=>runCallback && this.onPause());
    }

    resume(){
        this.setState({paused:false}, this.onResume);
    }

    stop(){
        this.reset();
        this.setState({}, this.onStop);
    }

    forward(){
        this.timeElapsed(this.state.duration.asSeconds())
    }
}

export class TimeInvester extends Component{
    constructor(props){
        super(props);
        this.state = {
            investment: props.investment || '00:00',
            invested: props.invested,
            duration: props.duration,
            targetDuration: moment.duration(props.investment),
            active: false,
            paused: false,
            countdown: props.countdown,
        };
        this.onInvestmentChanged = this.onInvestmentChanged.bind(this);
        this.timeElapsed = this.timeElapsed.bind(this);
        this.setActive = this.setActive.bind(this);
        this.setInactive = this.setInactive.bind(this);
        this.onChangeCheckbox = this.onChangeCheckbox.bind(this);

        this.onCheckboxChanged = props.onCheckboxChanged || ((d)=>d);
        this.onChangeInvestment = props.onChangeInvestment || ((d)=>d);
        this.onInvest = props.onInvest || ((d)=>d);
        this.onStart = ()=>{
            this.setActive(props.onStart);
        };
        this.onResume = ()=>{
            this.setActive(props.onResume);
        };
        this.onPause = ()=>{
            this.setInactive(props.onPause);
        };
        this.onStop = ()=>{
            this.setInactive(props.onStop);
        };
    }
    render(){
        const compactedClass = this.props.compacted?' hidden':'';
        const disableInputs = this.chronometer && (this.chronometer.state.paused || this.chronometer.state.started);
        return (
            <div>
                <div className={'invested-time text-center' + compactedClass}>
                    <span>Ya invertiste </span>
                    <span>
                        <Badge>
                            {this.state.invested.format("h:mm:ss", {
                                trim: false
                            })}
                        </Badge>
                    </span>
                </div>
                <FormGroup controlId="formValidationSuccess1" className={compactedClass}>
                    <Checkbox onChange={this.onChangeCheckbox}
                              disabled={disableInputs}
                              checked={this.state.countdown}><strong>
                        Invertir (HH:mm)
                    </strong></Checkbox>
                    <FormControl type='time'
                                 value={this.state.investment}
                                 disabled={disableInputs || !this.state.countdown}
                                 onChange={this.onInvestmentChanged} />
                </FormGroup>
                <Chronometer countdown={this.state.countdown}
                             ref={(ref)=>this.chronometer = ref}
                             onTimeElapsed={this.timeElapsed}
                             onStart={this.onStart}
                             onPause={this.onPause}
                             onResume={this.onResume}
                             onStop={this.onStop}
                             duration={this.state.duration}
                             targetDuration={this.state.targetDuration}/>
            </div>
        );
    }

    setActive(callback){
        callback = callback || ((d)=>d);
        this.setState({active: true}, callback);
    }

    setInactive(callback){
        callback = callback || ((d)=>d);
        this.setState({active: false}, callback);
    }

    start(callback){
        this.chronometer.start(callback);
    }

    pause(callback){
        this.chronometer.pause(callback);
    }

    onInvestmentChanged(event){
        this.state.duration.add(moment.duration(event.target.value).subtract(this.state.duration.clone()));
        this.setState({
            investment: event.target.value,
            duration: this.state.duration,
            targetDuration: this.state.duration.clone(),
        });
        this.onChangeInvestment(event.target.value);
    }

    onTick(secondsElapsed){
        this.timeElapsed(secondsElapsed);
    }

    onChangeCheckbox(e){
        const checked = e.target.checked;
        this.setState({countdown: checked}, ()=>this.onCheckboxChanged(checked));
    }

    timeElapsed(timeInSeconds){
        this.onInvest(timeInSeconds);
        const invested = this.state.invested.add(timeInSeconds, 'second');
        this.setState({invested: invested});
    }
}
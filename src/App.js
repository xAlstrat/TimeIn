import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';
import Grid from "react-bootstrap/es/Grid";
import Row from "react-bootstrap/es/Row";
import Col from "react-bootstrap/es/Col";
import Panel from "react-bootstrap/es/Panel";
import {TimeInvester} from "./TimeTracker";
import moment from 'moment';
import Button from "react-bootstrap/es/Button";
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import FormGroup from "react-bootstrap/es/FormGroup";
import InputGroup from "react-bootstrap/es/InputGroup";
import FormControl from "react-bootstrap/es/FormControl";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import { withCookies, Cookies } from 'react-cookie';


class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            activities: [],
            currentActivity: null,
            inputName: '',
            activitiesLoaded: false,
            hideInactive: false,
            compactView: false,
        };
        this.onInvest = this.onInvest.bind(this);
        this.onChangeInvestment = this.onChangeInvestment.bind(this);
        this.onSubmitAddForm = this.onSubmitAddForm.bind(this);
        this.onChangeActivityInputName = this.onChangeActivityInputName.bind(this);
        this.buildActivity = this.buildActivity.bind(this);
        this.onInverterStart = this.onInverterStart.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);
        this.resetActivity = this.resetActivity.bind(this);
        this.removeActivity = this.removeActivity.bind(this);
        this.removeAllActivities = this.removeAllActivities.bind(this);
        this.resetAllActivities = this.resetAllActivities.bind(this);
        this.toggleShowActivities = this.toggleShowActivities.bind(this);
        this.toggleCompactView = this.toggleCompactView.bind(this);

        this.SortableItem = SortableElement(({value}) =>
            this.buildActivity(value)
        );

        this.SortableList = SortableContainer(({items}) => {
            return (
                <Row componentClass='show-grid'>
                    {items.map((value, index) => (
                        <this.SortableItem key={`item-${value.name}`} index={index} value={value}/>
                    ))}
                </Row>

            );
        });

    }
    render() {
        const activityAlreadyExists = this.checkIfActivityExists();
        const hideInactive = this.state.hideInactive;
        const compactView = this.state.compactView;
        return (
            <Grid className='app'>
                <Row componentClass='show-grid'>
                    <Col md={12} className='text-center app-resume'>
                        <span>Has invertido </span>
                        <span><strong>
                            {this.state.activities.reduce((a, activity)=>{
                                return a.add(activity.invested);
                            }, moment.duration()).format('h:mm:ss', {trim: false})}
                        </strong></span>
                        <span> esta semana</span>
                    </Col>
                    <Col md={6}>
                        <form onSubmit={this.onSubmitAddForm}>
                            <FormGroup validationState={activityAlreadyExists?'error':null}>
                                <InputGroup>
                                    <FormControl type="text"
                                                 name='name'
                                                 placeholder={'Nueva actividad'}
                                                 onChange={this.onChangeActivityInputName}
                                                 value={this.state.inputName}/>
                                    <InputGroup.Button>
                                        <Button bsStyle='info'
                                                className='form-control'
                                                type='submit'
                                                disabled={this.state.inputName && !activityAlreadyExists?false:true}>
                                            Añadir <Glyphicon glyph="plus" />
                                        </Button>
                                    </InputGroup.Button>
                                </InputGroup>
                            </FormGroup>
                        </form>
                    </Col>
                    <Col md={6}>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Button>
                                    <Button bsStyle='info'
                                            title={compactView?'Vista extendida':'Vista compacta'}
                                            className='form-control'
                                            disabled={this.state.activities.length==0}
                                            onClick={this.toggleCompactView}>
                                        <Glyphicon glyph={compactView?'resize-full':'resize-small'} />
                                    </Button>
                                </InputGroup.Button>
                                <InputGroup.Button>
                                    <Button bsStyle='default'
                                            title={hideInactive?'Mostrar todo':'Ocultar inactivas'}
                                            className='form-control'
                                            disabled={this.state.activities.length==0}
                                            onClick={this.toggleShowActivities}>
                                        <Glyphicon glyph={hideInactive?'eye-open':'eye-close'} />
                                    </Button>
                                </InputGroup.Button>
                                <InputGroup.Button>
                                    <Button bsStyle='warning'
                                            className='form-control'
                                            disabled={this.state.activities.length==0}
                                            onClick={this.resetAllActivities}>Reiniciar <Glyphicon glyph="time" />
                                    </Button>
                                </InputGroup.Button>
                                <InputGroup.Button>
                                    <Button bsStyle='danger'
                                            className='form-control'
                                            onClick={this.removeAllActivities}
                                            disabled={this.state.activities.length==0}
                                            type='submit'>Eliminar todo <Glyphicon glyph="alert" />
                                    </Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <this.SortableList items={this.state.activities}
                                   onSortEnd={this.onSortEnd}
                                   axis="xy"
                                   distance={5}/>
            </Grid>
        );
    }

    componentDidMount(){
        this.load();
    }

    buildActivity(activity, index){
        const inverter = activity.inverter;
        const hide = this.state.hideInactive && inverter && (!inverter.state.active || inverter.state.paused);
        return (
            <Col md={3} sm={6} xs={6} key={activity.name}
                 className={'investment-item' + (hide?' hidden':'')}>
                <Panel bsStyle={inverter && inverter.state.active?'success':'default'}>
                    <Panel.Heading className='options-container'>
                        <Panel.Title componentClass="h3">
                            {activity.name}
                        </Panel.Title>
                        <div className='options options-right'>
                            <span className='option-item info'
                                  title={'Volver a comenzar'}
                                  onClick={()=>this.resetActivity(activity, index)}><Glyphicon glyph="repeat" /></span>
                            <span className='option-item danger'
                                  title={'Eliminar actividad'}
                                  onClick={()=>this.removeActivity(activity, index)}><Glyphicon glyph="remove" /></span>
                        </div>
                    </Panel.Heading>
                    <Panel.Body>
                        <TimeInvester
                            invested={activity.invested}
                            ref={(e)=>{
                                if(!e)
                                    return;
                                activity.inverter=e;
                            }}
                            investment={activity.investment}
                            countdown={activity.countdown}
                            duration={activity.duration}
                            compacted={this.state.compactView}
                            lastDatetime={activity.lastDatetime}
                            onInvest={(inv)=>this.onInvest(inv, activity)}
                            onStart={()=>this.onInverterStart(activity)}
                            onPause={()=>this.onInvesterPaused(activity)}
                            onStop={()=>this.onInvesterPaused(activity)}
                            onResume={()=>this.onInverterStart(activity)}
                            onChangeInvestment={(inv)=>this.onChangeInvestment(inv, activity)}
                            onCheckboxChanged={(checked)=>this.onCheckboxChanged(checked, activity)}
                        />
                    </Panel.Body>
                </Panel>
            </Col>
        );
    }

    addActivity(){
        this.state.activities.unshift({
            name: this.state.inputName,
            investment: '00:00',
            invested: moment.duration(),
            duration: moment.duration('00:00'),
            countdown: false,
        });
        this.setState({activities: this.state.activities, inputName: ''}, this.save);
    }

    resetActivity(activity, index){
        if(window.confirm('El tiempo invertido volverá a cero.')){
            activity.invested = moment.duration();
            this.setState({activities: this.state.activities}, this.save);
            activity.inverter.setState({invested: activity.invested});
        }
    }

    resetAllActivities(){
        if(window.confirm('Se reseteará el tiempo invertido de todas tus actividades.')){
            this.state.activities.map((activity)=>{
                activity.invested = moment.duration();
                activity.inverter.setState({invested: activity.invested});
            });
            this.setState({activities: this.state.activities}, this.save);
        }
    }

    removeActivity(activity, index){
        if(window.confirm('Se perderán las horas invertidas en esta actividad.')){
            if(this.state.currentActivity && (activity.name === this.state.currentActivity.name))
                this.setState({currentActivity: null});
            this.state.activities.splice(index, 1);
            this.setState({activities: this.state.activities}, this.save);
        }
    }

    removeAllActivities(){
        if(window.confirm('Se eliminará toda tu configuración actual.')){
            this.setState({activities: []}, this.save);
        }
    }

    toggleShowActivities(){
        this.setState({hideInactive:!this.state.hideInactive});
    }

    toggleCompactView(){
        this.setState({compactView:!this.state.compactView}, this.save);
    }

    checkIfActivityExists(){
        return this.state.activities.filter((act)=>act.name.trim() === this.state.inputName.trim()).length > 0;
    }

    save(){
        const data = {
            activities: this.state.activities.map((act)=>({
                name: act.name,
                investment: act.investment,
                invested: act.invested.asSeconds(),
                duration: act.duration.asSeconds(),
                countdown: act.countdown,
                lastDatetime: act.lastDatetime && act.lastDatetime.format(),
                active: this.state.currentActivity && this.state.currentActivity.name === act.name,
            })),
           compactView: this.state.compactView,
        };
        const {cookies} = this.props;
        cookies.set('app', data, {
            expires: new Date('2999-01-01'),
        });
    }

    load(){
        const {cookies} = this.props;
        let app = cookies.get('app') || {compactView: false, activities: []};
        if(app instanceof Array)
            app = {compactView: false, activities: app};
        const acts = app.activities.map((act)=>{
            let {invested, duration, lastDatetime, ...rest} = act;
            return {
                ...rest,
                lastDatetime: lastDatetime && moment(lastDatetime),
                invested: moment.duration(invested, 'seconds'),
                duration: moment.duration(duration, 'seconds'),
            }
        });
        this.setState({
            activities: acts,
            activitiesLoaded: true,
            compactView: app.compactView,
        }, ()=>{
            this.state.activities.map((act)=>act.active && act.inverter.start(true))
        });
    }

    reset(){
        this.setState({activities: []});
        this.props.cookies.remove('app');
    }

    onInverterStart(activity){
        activity.active = true;
        activity.lastDatetime = activity.inverter.chronometer.state.lastDatetime;
        if(this.state.currentActivity) {
            this.state.currentActivity.active = false;
            this.state.currentActivity.inverter.pause(false);
        }
        this.setState({currentActivity: activity}, this.save)
    }

    onInvesterPaused(activity){
        activity.active = false;
        this.setState({currentActivity: null}, this.save);
    }

    onInvest(invested, activity){
        activity.lastDatetime = activity.inverter.chronometer.state.lastDatetime;
        this.setState({activities: this.state.activities}, this.save);
    }

    onChangeInvestment(investment, activity){
        activity.investment = investment;
        this.setState({activities: this.state.activities}, this.save);
    }

    onCheckboxChanged(checked, activity){
        activity.countdown = checked;
        this.setState({activities: this.state.activities}, this.save);
    }

    onChangeActivityInputName(event){
        this.setState({inputName: event.target.value});
    }

    onSubmitAddForm(event){
        event.preventDefault();
        this.addActivity();
    }

    onSortEnd = ({oldIndex, newIndex}) => {
        this.setState({
            activities: arrayMove(this.state.activities, oldIndex, newIndex),
        }, this.save);
    };

}

export default withCookies(App);

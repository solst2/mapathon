import App, {FormInput} from "./App";
import React, {Component} from 'react';
import './App.css';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup  } from 'react-leaflet';
var cityIcon = L.icon({
    iconUrl: 'https://static.thenounproject.com/png/198234-200.png',
    iconSize: [60, 60],
    iconAnchor: [40, 55],
    popupAnchor: [0, -10]
});

export class CitiesList extends React.Component {
    constructor(props) {
        super(props);

    }
    render() {
        let { citiesData, updateCities} = this.props;
        return (
            <div>
                {   citiesData.map((city) => (
                    <div>
                        <p>
                            <div style={{ color: 'white' }}>

                                {city.name}  {city.coordinates[1]}  {city.coordinates[0]}
                                <button onClick=  { (e) =>  {
                                    let updatedCitiesData = [...citiesData];
                                    let updatedCity = updatedCitiesData.find((c) => c.name === city.name);
                                    updatedCity.displayed = !updatedCity.displayed;
                                    updateCities(updatedCitiesData);
                                   // console.log(city.displayed)
                                }}>{!city.displayed ? 'Show ' : 'Hide'}</button>
                            </div>
                        </p>

                    </div>

                ))}
                <CityForm  onCityAdd={this.handleAddCityClick} />
            </div>
        );
    }

    handleAddCityClick = c => {
        // Append to books array and reset newBook object in state
        let newCity={name: c.name, coordinates:[c.lng, c.lat], population:c.population,displayed:c.displayed}
       /*
        {    this.props.citiesData.map((city) => (
          //  console.log(city.name)

        ))}*/
        this.props.citiesData.push(newCity );
        let updatedCitiesData = [this.props.citiesData];
        this.props.updateCities(this.props.citiesData);

    };

}


export class CityMarker extends  React.Component {
    constructor(props) {
        super(props);
        this.state = {displayed: props.displayed}

    }

    componentDidMount() {
    }

    componentWillUnmount() {

    }


    render() {
        // Object destructuring syntax is used here for props
        let {name, coordinates, population, displayed} = this.props;
        // Element variable to hold the customized title based on liked status


        return (
            <Marker icon={cityIcon}
                    position={[coordinates[1], coordinates[0]]}>

                <Popup permanant>
                    <span>{name} <img width={10} height={10}
                                      src="https://static.thenounproject.com/png/198234-200.png"/><br/>{coordinates[1]} / {coordinates[0]} { !this.state.displayed}</span>
                    <button onClick={(e) => {

                        this.setState(prevState => ({ displayed: !prevState.displayed }));
                        console.log(this.state.displayed)
                    }}></button>
                </Popup>


            </Marker>
        );

    }
}
export class CityForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // Empty newBook object for holding form input values
            newCity: {
                name:'',
                lat:'',
                lng:'',
                population: '',
                displayed:false

            }
        };

    }

    // Update newBook object on form input change
    handleInputChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        // Merge changed form field into existing newBook object
        this.setState(prevState => ({
            // Spread existing newBook object and overwrite
            // dynamic [name] property with the new value
            newCity: { ...prevState.newCity, [name]: value }
        }));
    };

    // Add new book
    handleCityAdd = event => {
        // Avoid reloading the page on form submission
        event.preventDefault();

        // Add book in the list of books
        this.props.onCityAdd(this.state.newCity);

        // Reset fields of the newBook object
        this.setState({
            newCity: {
                name:'',
                lat:'',
                lng:'',
                population: '',
                displayed:false

            }
        });



    };



    render() {
        return (
            //Render a form for adding a new book
            <div>
                <h2>Add a new city</h2>
                <form onSubmit={this.handleCityAdd}>
                    <FormInput
                        type="text"
                        name="name"
                        placeholder="City Name"
                        value={this.state.newCity.name}
                        onChange={this.handleInputChange}

                    />
                    <FormInput
                        type="number"
                        name="lat"
                        placeholder="Latitude"
                        value={this.state.newCity.lat}
                        onChange={this.handleInputChange}
                    />
                    <FormInput
                        type="number"
                        name="lng"
                        placeholder="Longitude"
                        value={this.state.newCity.lng}
                        onChange={this.handleInputChange}
                    />

                    <button type="submit">Add City</button>
                    <br />
                    <br />
                </form>
            </div>
        );
    }
}

export default CityForm;

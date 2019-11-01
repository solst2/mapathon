import React from "react";
import {FormInput} from "./FormInput";
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
export default class POIForm extends React.Component {



    constructor(props) {
        super(props);
        let poiInfo = props.poisList.find(poi => poi.id == props.id);



        this.state = {
            newPOI: {
                id: poiInfo.id,
                name: poiInfo.name,
                description: poiInfo.description,
                isSaved: false,
                image: poiInfo.image,
                url: poiInfo.url,
                group: 4,
                lat: this.props.position.lat,
                lng: this.props.position.lng,
                tag: "",
                category:[]
            }
        };
    }

    handleInputChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState(prevState => ({
            newPOI: { ...prevState.newPOI, [name]: value }
        }));
    };

    handlePOIAdd = event => {
        // Avoid reloading the page on form submission
        event.preventDefault();
        console.log("added" + this.state.newPOI.id);
        this.state.newPOI.isSaved = true;
        this.props.updatePOI(this.state.newPOI);
        this.props.addPOI(this.state.newPOI);
    };

    render() {

        console.log("categories")
        let options=[]

        this.props.categories.map((cat)=>
        {
        options.push({ label: cat.name, value: cat.name})}
        )

        return (

            <div>
                <form onSubmit={this.handlePOIAdd}>
                    <p>
                        Save a point at {this.props.position.lat.toFixed(2)}{" "}
                        {this.props.position.lng.toFixed(2)}{" "}
                    </p>
                    <FormInput
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={this.state.newPOI.name}
                        onChange={this.handleInputChange}
                    />
                    <textarea
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={this.state.newPOI.description}
                        onChange={this.handleInputChange}
                    />
                    <FormInput
                        type="text"
                        name="image"
                        placeholder="Image"
                        value={this.state.newPOI.image}
                        onChange={this.handleInputChange}
                    />
                    <FormInput
                        type="text"
                        name="url"
                        placeholder="URL"
                        value={this.state.newPOI.url}
                        onChange={this.handleInputChange}
                    />
                    <FormInput
                        type="text"
                        name="tag"
                        placeholder="Tags"
                        value={this.state.newPOI.tag}
                        onChange={this.handleInputChange}
                    />
                    <ReactMultiSelectCheckboxes options={options}  onChange={this.handleInputChange}   value={this.state.newPOI.category}/>
                    <br />
                    <button className={"ButtonBar"} type="submit">
                        Save
                    </button>
                    <br />
                    <br />
                </form>
            </div>
        );
    }
}
import React from "react";
import {FormInput} from "./FormInput";
import { Multiselect } from 'multiselect-react-dropdown';
import {Marker} from "react-leaflet";
let selectedCategoreis=[]
let selectedTags=[]
export default class POIForm extends React.Component {

    constructor(props) {
        super(props);

        let poiInfo = props.poisList.find(poi => poi.id == props.id);
        this.MultiselectCat = React.createRef();
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
                Categories:poiInfo.Categories,
                Tags:poiInfo.Tags,
                Creator:{group:4}

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
        this.state.newPOI.isSaved = true;
       this.state.newPOI.Categories=selectedCategoreis;
       this.state.newPOI.Tags=selectedTags;
        this.props.updatePOI(this.state.newPOI);
        this.props.addPoi(this.state.newPOI);
    };
    onSelect(optionsList, selectedItem) {
        selectedCategoreis=optionsList;
    }
    onSelectTag(optionsList, selectedItem) {
        selectedTags=optionsList;
    }
    onRemove(optionsList, selectedItem) {
        selectedCategoreis=optionsList;
    }

    render() {
        selectedCategoreis=this.state.newPOI.categories;
        return (

            <div>
                <form onSubmit={this.handlePOIAdd} onLoad={this.onSelect}>
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

                    <Multiselect
                        ref={m => {
                            this.MultiselectCat = m;
                        }}
                        options={ this.props.categories}
                                 displayValue="name"
                                 selectedValues={this.state.newPOI.Categories}
                                 value={this.state.newPOI.Categories}
                                 placeholder="Categories"
                                 onSelect={this.onSelect}
                                 groupBy={"group"}
                        // Function will trigger on select event
                        //onRemove={this.onRemove} // Function will trigger on remove event
                        // Property name to display in the dropdown options
                    />
                    <Multiselect options={ this.props.tags}
                                 displayValue="name"
                                 selectedValues={this.state.newPOI.Tags}
                                 placeholder="Tags"
                                 value={this.state.newPOI.Tags}
                                 onSelect={this.onSelectTag} // Function will trigger on select event
                        //onRemove={this.onRemove} // Function will trigger on remove event
                        // Property name to display in the dropdown options
                    />
                    <br />
                    <button className={"ButtonBar"}  type="submit">
                        Save
                    </button>
                    <br />
                    <br />
                </form>
            </div>
        );
    }
}
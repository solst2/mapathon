import React from "react";
import { FormInput } from "./FormInput";
import { Multiselect } from "multiselect-react-dropdown";
let selectedCategoreis = [];
let selectedTags = [];
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
        Categories: [],
        Tags: []
      },
      multiSelect: poiInfo.Categories
    };
  }

  componentDidMount(): void {
    let options = [];

    this.props.categories.map(cat => {
      options.push({ name: cat.name, id: cat.id });
    });

    this.setState({ multiSelect: options });
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState(prevState => ({
      newPOI: { ...prevState.newPOI, [name]: value }
    }));
  };
  handleChange = event => {
    var options = event.target.value;
    var value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }

    console.log(options);
  };
  handlePOIAdd = event => {
    // Avoid reloading the page on form submission
    event.preventDefault();
    console.log("added" + this.state.newPOI.id);
    this.state.newPOI.isSaved = true;
    this.state.newPOI.Categories = selectedCategoreis;
    this.state.newPOI.Tags = selectedTags;
    this.props.updatePOI(this.state.newPOI);
    this.props.addPOI(this.state.newPOI);
  };
  onSelect(optionsList, selectedItem) {
    selectedCategoreis = optionsList;
  }
  onSelectTag(optionsList, selectedItem) {
    selectedTags = optionsList;
  }
  onRemove(optionsList, selectedItem) {
    selectedCategoreis = optionsList;
  }

  render() {
    console.log("categories");

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
          <Multiselect
            options={this.props.categories}
            displayValue="name"
            selectedvalues={this.state.newPOI.Categories}
            placeholder="Categories" // Preselected value to persist in dropdown
            onSelect={this.onSelect} // Function will trigger on select event
            //onRemove={this.onRemove} // Function will trigger on remove event
            // Property name to display in the dropdown options
          />
          <Multiselect
            options={this.props.tags}
            displayValue="name"
            selectedvalues={this.state.newPOI.Tags}
            placeholder="Tags" // Preselected value to persist in dropdown
            onSelect={this.onSelectTag} // Function will trigger on select event
            //onRemove={this.onRemove} // Function will trigger on remove event
            // Property name to display in the dropdown options
          />
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

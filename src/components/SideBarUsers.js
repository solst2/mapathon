import React from "react";
import "./POI.css";
import deleteIcon from "../icons/delete.png"
import targetIcon from "../icons/target.png"
import shareIcon from "../icons/share.png"
import {Multiselect} from "multiselect-react-dropdown";
import {FormInput} from "./FormInput";
export default function SideBarPoi(props) {
    const { userList} = props;
    function ActionLink() {
        function handleClick(e) {
            e.preventDefault();
            console.log('The link was clicked.');
        }
    }
    return (
        <div>
        <form onSubmit={ActionLink}>
            <Multiselect options={ userList}
                         displayValue="name"
                         placeholder="Email text"// Preselected value to persist in dropdown
                        // Function will trigger on select event
                //onRemove={this.onRemove} // Function will trigger on remove event
                // Property name to display in the dropdown options
            />
            <textarea
                type="text"
                name="description"
                placeholder="Email"

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

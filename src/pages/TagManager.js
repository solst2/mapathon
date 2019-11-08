import React, { useState, Component, useEffect, useRef } from "react";
import {FormInput} from "../components/FormInput";
import {Multiselect} from "multiselect-react-dropdown";

import {useAuth0} from "../react-auth0-spa";
import request from "../utils/request";
import {Redirect} from "react-router-dom";
import deleteIcon from "../icons/delete.png"
import targetIcon from "../icons/target.png"
import shareIcon from "../icons/share.png"
import forbidden from "../icons/forbidden.png"
import NavBar from "../components/NavBar";
export default function TagManger(props) {
    let [tags, setAlltags] = useState([]);
    let [tag,setTag]=useState({name:'',group:'',image:''});
    let [isDisable,setDisable]=useState(false)
    const {
        isAuthenticated,
        loginWithRedirect,
        loading,
        getTokenSilently,
        logout,
        user
    } = useAuth0();
    useEffect(() => {
        const fn = async () => {


            setAlltags (await getAllO('tag'));

        };
        fn();
    }, [isAuthenticated, loginWithRedirect, loading]);
    async function getAllO(object) {
        return await request.getAllObject(getTokenSilently, loginWithRedirect, object);
    }

    function handleInputChange (event) {

        const target = event.target;
        const value = target.value;
        const name = target.name;
        let updatedTag = ({...tag})
        updatedTag[name]=value
        setTag(updatedTag);
    }

    async  function  handlecatAdd  (event) {
        event.preventDefault();

        if(tag.id==null)
        {await request.addNewObject("tag",tag, getTokenSilently, loginWithRedirect);}
        else
        {     let answer = await request.updateObject("tag",tag.id, tag, getTokenSilently, loginWithRedirect);}

        event.preventDefault();
        setAlltags (await getAllO('tag'));
        setDisable(false);
    }
    async  function  deleteCategory  (event) {
        await request.deleteObject("tag",event.target.name, getTokenSilently, loginWithRedirect);
        setAlltags (await getAllO('tag'));
    }

    function  AddTag  (event) {
        setDisable(true);
        setTag(tags.push({name:'',group:'',image:'',iscreated:true}));

    }
    function  ModifyCat  (event) {
        setDisable(true);
        let updatetagList=tags

        let findTag= updatetagList.find(c=>c.id==event.target.name)
        console.log(findTag.id)

        updatetagList= tags.filter(c=>c!==findTag)
        findTag.iscreated=true;
        updatetagList.push(findTag);

        setAlltags(updatetagList)
        setTag(findTag)
    }
    if(!isAuthenticated)
    {return (
        <Redirect to="/" />)
    }

    let catcreat=false;
    return (


        <div>
            <div class="wrapper">

                <form onSubmit={handlecatAdd}>
                    <div className="table">

                        <div className="row header">
                            <div className="cell">
                                Name
                            </div>
                            <div className="cell">
                                Marker
                            </div>
                            <div className="cell">
                                Creator
                            </div>
                            <div className="cell">
                                Edit
                            </div>
                        </div>

                        { tags.map(t=>{
                            if(t.iscreated)
                                return <div className="row">
                                    <div className="cell" >
                                        <FormInput
                                            type="text"
                                            name="name"
                                            placeholder="name"
                                            value={tag.name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="AddForm" >
                                        <FormInput
                                            type="text"
                                            name="image"
                                            placeholder="marker"
                                            value={tag.image}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="cell" data-title="Location"><button className="PersoBtn">Save</button> </div>
                                </div>

                            return <div className="row">
                                <div className="cell" >{t.name}     </div>
                                <div className="cell" ><img width={50} height={50} src={t.image}/>   </div>
                                <div className="cell" >{t.Creator.name}   </div>
                                {t.Creator.id===user.sub&&<div className="cell" ><img width={20} height={20} src={deleteIcon} onClick={deleteCategory} name={t.id}></img> <img width={10} height={10} src="https://image.flaticon.com/icons/svg/61/61456.svg" name={t.id} onClick= { ModifyCat} /> </div>           }
                                {t.Creator.id!==user.sub&&<div className="cell" ></div>}
                            </div>
                        })}
                    </div>
                    <br/>{tags.map((tag)=> tag.iscreated? catcreat=true : null)}

                    {!isDisable&& !catcreat && <button className="PersoBtn" style={{width:"100%"}} onClick={AddTag}>Add tag</button>}}
                </form>
            </div>
        </div>
    );

}
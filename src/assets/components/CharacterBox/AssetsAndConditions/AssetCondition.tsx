import { useState, useRef } from "react";
import ConditionForceOptions from "./ConditionForceOptions";
import { assetsBoxConditionCart } from "./Assets";

export default function AssetCondition({label, force, assetID, conditionID, assetName, onContextMenu}: props) {
    const [editingForce, setEditingForce] = useState(false);
    const selectRef = useRef<HTMLSelectElement>(null);
    return(
        <div onContextMenu = {() => onContextMenu(assetID, conditionID, assetName, force, label)}>
            <div className = 'trait' onClick = {() => setEditingForce(prev => !prev)}> 
                {label} <span className = 'numeric-value'>{force}</span>
            </div>
            {editingForce && <EditForm />}
        </div>
    )

    function EditForm(){
        return(
            <select ref = {selectRef} onChange = {handleSelectChange}>
                <ConditionForceOptions />
            </select>
        )
    }

    function handleSelectChange(){
        if (!selectRef.current) return;
        const newCart = [...assetsBoxConditionCart.value];
        newCart.push({label: label, force: Number(selectRef.current.value), assetID: assetID, conditionID: conditionID, command: 'edit', assetName: assetName});
        assetsBoxConditionCart.value = newCart;
    }
}

type props = {
    label: string,
    force: number,
    assetID: string,
    conditionID: string,
    assetName: string,
    onContextMenu: Function
}

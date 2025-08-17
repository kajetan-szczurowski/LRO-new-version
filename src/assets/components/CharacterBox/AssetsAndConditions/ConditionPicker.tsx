
import { withInputFilter } from "../../withInputFilter";
import { getConditions } from "./conditionNames";
import { useMemo, useState, useRef } from "react";
import { ConditionInCart } from "./ConditionTypes";
import { currentAssetConditionState } from "./conditionPickState";
import ConditionsCart from "./ConditionsCart";
import { assetsBoxConditionCart } from "./Assets";
import ConditionForceOptions from "./ConditionForceOptions";

export default function ConditionPicker({callback}: {callback: Function}) {
    const conditions = useMemo(getConditions, []);
    const [currentWindow, setCurrentWindow] = useState<'Predefined'|'Custom'>('Predefined');
    const [conditionsCart, setConditionsCart] = useState<ConditionInCart[]>([]);
    const forceRef = useRef<HTMLSelectElement>(null);
    const customInputRef = useRef<HTMLInputElement>(null);
    const predefinedButtonClassName = currentWindow === 'Predefined'? 'character-box-clicked' : 'character-box-clickable';
    const customButtonClassName = currentWindow === 'Custom'? 'character-box-clicked' : 'character-box-clickable';
    const PredefinedPicker = withInputFilter(PredefinedConditionPicker);
    return (
        <>
            <h1>{currentAssetConditionState.value.name} new conditions:</h1>
            <div>
                <button onClick = {() => setCurrentWindow('Predefined')} className = {`${predefinedButtonClassName} character-box-button`}>Predefined</button>
                <button onClick = {() => setCurrentWindow('Custom')} className = {`${customButtonClassName} character-box-button`}>Custom</button>
            </div>
            <ForceInput/>
            {currentWindow === 'Predefined' && <PredefinedPicker conditions = {conditions} />}
            {currentWindow === 'Custom' && <CustomPicker />}
            <ConditionsCart conditions = {conditionsCart} handleClickCallback = {handleCartItemClick}/>
            <button className = "character-box-clickable character-box-button" onClick = {handleSubmit}>Submit</button>
        </>
    )

    function PredefinedConditionPicker({conditions, filter }:PredefinedProps){
        const filteredConditions = conditions.filter(cond => cond.toLowerCase().includes(filter.toLowerCase()));
        return(
            <section className = "condition-picker-grid-group">
            {filteredConditions.map(cond => {
                return(
                    <button className = "character-box-button character-box-clickable" onClick = {() => addToCart(cond)} key = {cond}>
                        {cond}
                    </button>
                )
            })}
            </section>
        )
    }

    function CustomPicker(){
        return(
            <form onSubmit = {handleCustomConditionSubmit}>
                <input type = 'text' className = "inputFilter" ref = {customInputRef}></input>
                <label>Custom condition</label>
            </form>
        )
    }

    function ForceInput(){
        return(
            <div>
                <label>Force:</label>
                <select ref = {forceRef}>
                    <ConditionForceOptions />
                </select>
            </div>
        )
    }

    function handleCustomConditionSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!customInputRef.current) return;
        addToCart(customInputRef.current.value);
        customInputRef.current.value = '';
    }



    function addToCart(conditionName: string){
        if (!forceRef.current) return;
        const forceValue = forceRef.current.value;
        setConditionsCart(currentConditions => {
            const foundCondition = conditionsCart.find(cond => cond.label === conditionName);
            const newConditions = [...currentConditions];
            if (foundCondition){
                foundCondition.label = conditionName;
                foundCondition.force = Number(forceValue);
                return newConditions;
            }
            const assetDataPayload = {assetName: currentAssetConditionState.value.name, assetID: currentAssetConditionState.value.id};
            newConditions.push({label: conditionName, force: Number(forceValue), conditionID: Date.now(), command: 'append', ...assetDataPayload});
            return newConditions;
            })
    }

    function handleCartItemClick(id: string | number){
        setConditionsCart(currentConditions => {
            const newConditions = [...currentConditions].filter(cond => cond.conditionID != id);
            return newConditions;
        });
    }

    function handleSubmit(){
        assetsBoxConditionCart.value = assetsBoxConditionCart.value.concat(conditionsCart);
        callback();
        setConditionsCart([]);
    }
}

type PredefinedProps = {
    conditions: string[],
    filter: string
}
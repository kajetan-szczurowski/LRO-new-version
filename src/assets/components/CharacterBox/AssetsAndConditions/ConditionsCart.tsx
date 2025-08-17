import NumericAndTextSpans from "../../NumericAndTextSpans";
import { ConditionInCart } from "./ConditionTypes";

export default function ConditionsCart({conditions, handleClickCallback}: props) {

const SHOW_ID = false; //for testing 

return(
        <ul>
            <h2>Picked:</h2>
            <div className = "assets-condition-cart">
                {conditions.map(condition => {
                    const textValue = `[${condition.force}] ${condition.label} `;
                    return(
                        <li key = {condition.conditionID} onClick = {() => handleClickCallback(condition.conditionID)}>
                            <div><NumericAndTextSpans value = {textValue} digitsClass = 'numeric-value' nonDigitsClass = 'non-numeric-value' /></div>
                            <div>Action: {condition.command}</div>
                            {condition.assetName && <div>Name: {condition.assetName}</div>}
                            {SHOW_ID && condition.assetID && <div className = "numeric-value">ID: {condition.assetID}</div>}
                        </li>
                    )
                })}
            </div>
        </ul>
)


}

type props = {
    conditions: ConditionInCart[],
    handleClickCallback: Function
}

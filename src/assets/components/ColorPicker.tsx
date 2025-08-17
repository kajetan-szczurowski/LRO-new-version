import { useState, useRef } from "react"

export default function ColorPicker({currentColor, label, callback, drawingID, drawingOwner, secondaryButtonClassName = undefined} : props) {
    const [colorChangeVisible, setColorChangeVisible] = useState(false);
    const newColorRef = useRef<HTMLInputElement>(null);
    const newColorWrapperDisplay = colorChangeVisible ? 'flex' : 'none';
    const buttonClassName = secondaryButtonClassName?? 'character-box-button edit-button';
    return (
        <div>
            <div className = 'color-picker-row'>
                <strong className = 'color-picker-label'>{label}</strong>
                <div className = 'color-picker-color-box' style = {{'background': currentColor}}></div>
                <button className = {buttonClassName} onClick = {() => setColorChangeVisible(prev => !prev)}>Change</button>
            </div>

            <div className = 'color-picker-row' style = {{'display': newColorWrapperDisplay}}>
                <strong className = 'color-picker-label'>New color</strong>
                <input className = 'color-picker-color-box' type = 'color' ref = {newColorRef}/>
                <button  className = {buttonClassName} onClick = {handleColorChange}>Submit</button>
            </div>
        </div>
    )

    function handleColorChange(){
        if (!newColorRef.current) return;
        callback(drawingID, drawingOwner, newColorRef.current.value);
    }
}

type props = {
    currentColor: string,
    label?: string,
    callback: Function
    secondaryButtonClassName?: string,
    drawingID: string,
    drawingOwner: string
}
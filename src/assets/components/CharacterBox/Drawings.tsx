import { useState } from 'react'
import { useSocket } from '../../providers/SocketProvider'
import { DrawingData } from '../Map/mapDrawingMode';
import { usersDataState } from '../../states/GlobalState';
import ColorPicker from '../ColorPicker';
import NumericAndTextSpans from '../NumericAndTextSpans';

const MAX_ANGLE = 359;
const MAX_SIZE_FEETS = 100;

export default function Drawings() {
    const socket = useSocket();
    const userID = usersDataState.value.userID;
    const userIsGM = usersDataState.value.isGM;
    const [drawingsList, setDrawingsList] = useState<DrawingData[]>(() => { socket.emit('give-me-drawings', userID); return [] });

    socket.on('drawing-list', payload => setDrawingsList(payload));
    socket.on('refresh-drawings', () => socket.emit('give-me-drawings', userID));
    return(
        <>
        <h2 className = 'drawings-counter'>
            {!userIsGM && <NumericAndTextSpans value = {`${drawingsList.length}/3`} digitsClass = 'numeric-value' nonDigitsClass = 'non-numeric-value'/>}
        </h2>

        <ol>
            {drawingsList.map(oneDrawing => {
                    const color = oneDrawing.color.substring(0,7);
                    const headerText = `${oneDrawing.shapeType} (${Math.round(oneDrawing.x)}, ${Math.round(oneDrawing.y)})`;
                    const angleText = (oneDrawing.shapeType !== 'circle')? oneDrawing.angle: '-';
                    const colorPickerProps = {drawingID: oneDrawing.id ?? '', drawingOwner: oneDrawing.userName ?? '', currentColor: color};
                    return(
                        <li key = {oneDrawing.id} className = 'drawing-info-wrapper'>
                            <h3>
                                <NumericAndTextSpans value = {headerText} digitsClass = 'numeric-value' nonDigitsClass = 'non-numeric-value'/>
                            </h3>
                            <div className = 'drawing-info-container'>

                                <div className = 'drawing-info-column'>
                                    <DrawingProperty label = 'Feets' value = {oneDrawing.feets}/>
                                    <DrawingProperty label = 'Meters' value = {oneDrawing.meters}/>
                                    <DrawingProperty label = 'Angle' value = {angleText}/>
                                </div>

                                <div className = 'drawing-info-column'>
                                    {userIsGM && <DrawingProperty label = 'User' value = {oneDrawing.userName || ''}/>}
                                    <div className = 'drawing-color-picker-wrapper'>
                                        <ColorPicker {...colorPickerProps} label = 'Color' callback = {changeColor} />
                                    </div>

                                </div>

                            </div>
                            
                            {userIsGM && <DrawingButtons id = {oneDrawing.id ?? ''} />}
                            {userIsGM && <Edit drawing = {oneDrawing}/>}
                            {userIsGM && <Delete drawing = {oneDrawing}/>}
                        </li>
                    )
                })}
        </ol>
        </>
    )

    function changeColor(drawingID: string, owner: string, newColor: string){
        const payload = {userID: userID, drawingID: drawingID, owner: owner, color: `${newColor}90`}
        socket.emit('drawing-change-color', payload);
    }

    function DrawingButtons({id}: {id: string}){
        return(
            <div className = 'drawing-buttons'>
                <button className = 'character-box-button edit-button' onClick = {() => {handleButtonClick('edit', id || '')}}>Edit</button>
                <button className='delete-button delete-drawing-button' onClick = {() => {handleButtonClick('delete', id || '')}}>Delete</button>
            </div>
        )
    }

    function DrawingProperty({label, value, color = ''}: PropertyType){
        const preparedValue = typeof value === 'number'? value.toFixed(2) : value;
        return(
        <div>
            <strong>{label}</strong>
            {!color && <NumericAndTextSpans value = {preparedValue} digitsClass = 'numeric-value' nonDigitsClass = 'non-numeric-value'/>}
            {color && <span className = 'drawing-color-span' style = {{'background': color, 'color': color}}></span>}
        </div>
        )
    }

    function EditLine({drawing}: {drawing: DrawingData}){
        if (!drawing.linePoint1 || !drawing.linePoint2) return(<></>)
        return(
            <form onSubmit = {(e) => handleLineEditSubmit(e, drawing.id || "", drawing.userName || "")}>
                <h3>Editing line</h3>
                <label>x1:</label>
                <input type = 'number' defaultValue = {Math.round(drawing.linePoint1?.x)} name = {'x1'}></input>
                <label>x2:</label>
                <input type = 'number' defaultValue = {Math.round(drawing.linePoint2?.x)} name = {'x2'}></input>
                <label>y1:</label>
                <input type = 'number' defaultValue = {Math.round(drawing.linePoint1?.y)} name = {'y1'}></input>
                <label>y2:</label>
                <input type = 'number' defaultValue = {Math.round(drawing.linePoint2?.y)} name = {'y2'}></input>
                <input type = 'submit' value = 'Submit' />
            </form>
        )
    }

    function EditCircular({drawing}: {drawing: DrawingData}){
        return(
            <form onSubmit = {(e) => handleCircularEditSubmit(e, drawing.id || "", drawing.userName || "")} >
                <h3>Editing {drawing.shapeType}</h3>
                <label>x:</label>
                <input type = 'number' defaultValue = {drawing.x.toFixed(2)} name = {'x'}></input>
                <label>y:</label>
                <input type = 'number' defaultValue = {drawing.y.toFixed(2)} name = {'y'}></input>
                <label>Size [feets]:</label>
                <input type = 'number' defaultValue = {Number(drawing.feets).toFixed(2)} max = {MAX_SIZE_FEETS} min = '0' name = {'size'}></input>
                <label>Angle:</label>
                <input type = 'number' defaultValue = {Number(drawing.angle.toFixed(2))} max = {MAX_ANGLE} min = '0' name = {'angle'}></input>
                <input type = 'submit' value = 'Submit' />
            </form>
        )
    }

    function Edit({drawing}: {drawing: DrawingData}){
        return(
            <dialog id = {`edit-drawing-${drawing.id}`}>
                {drawing.shapeType === 'line' && <EditLine drawing = {drawing}/>}
                {['circle', 'cone'].includes(drawing.shapeType) && <EditCircular drawing = {drawing}/>}
            </dialog>
        )
    }

    function Delete({drawing}: {drawing: DrawingData}){
        return(
            <dialog id = {`delete-drawing-${drawing.id}`}>
                Are you sure to delete this {drawing.shapeType} ({drawing.feets} feets)?
                <div>
                    <button onClick = {() => handleDelete(drawing.id ?? '', drawing.userName ?? '')}>Yes</button>
                    <button onClick = {() => closeDialog('delete', drawing.id || '')}>No</button>
                </div>
            </dialog> 
        )
    }

    function handleButtonClick(operation: 'edit' | 'delete', id: string){ 
        const dialogObject = document.getElementById(`${operation}-drawing-${id}`) as HTMLDialogElement;
        if (!dialogObject) return;
        if (dialogObject.open) return;
        dialogObject.showModal();
    }

    function closeDialog(operation: 'edit' | 'delete', id: string){
        const dialogObject = document.getElementById(`${operation}-drawing-${id}`) as HTMLDialogElement;
        if (!dialogObject) return;
        dialogObject.close();
    }

    function handleLineEditSubmit(e:React.FormEvent, id:string, owner: string){
        e.preventDefault();
        const target = e.target as any;
        const {x1, x2, y1, y2} = target.elements;
        socket.emit('edit-drawing', {userID: userID, drawingID: id, x1: x1.value, x2: x2.value, y1: y1.value, y2: y2.value, owner: owner});
        closeDialog('edit', id);
    }

    function handleCircularEditSubmit(e:React.FormEvent, id:string, owner: string){
        e.preventDefault();
        const target = e.target as any;
        const {x, y, size, angle} = target.elements;
        socket.emit('edit-drawing', {userID: userID, drawingID: id, x: x.value, y: y.value, size: size.value, angle: angle.value, owner: owner});
        closeDialog('edit', id);
    }

    function handleDelete(id: string, owner: string){
        socket.emit('delete-drawing', {userID: userID, drawingID: id, owner: owner});
        closeDialog('delete', id);
    }


}

type PropertyType = {
    label: string,
    value: string | number,
    color? :string
}

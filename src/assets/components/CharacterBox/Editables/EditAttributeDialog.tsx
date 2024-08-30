import { useRef} from 'react'
import { signal, useSignalEffect } from '@preact/signals-react'
import { usersDataState } from '../../../states/GlobalState';
import { useSocket } from '../../../providers/SocketProvider';

const TITLE_ON_MOUNT_VALUE = 'dialog-first-run';
export const editSignal = signal<AttributeEditType>({text: '', maxLength: 30, title: TITLE_ON_MOUNT_VALUE});


export default function EditAttributeDialog() {
    const DEFAULT_MAX_INPUT_LENGTH = 30;
    const LABEL_LENGTH_IF_TITLE_OMITTED = 30;
    const socket = useSocket();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const oneLinerRef = useRef<HTMLInputElement>(null);
    const multiLinerRef = useRef<HTMLTextAreaElement>(null);


    const primaryDivRef = useRef<HTMLDivElement>(null);
    const secondaryDivRef = useRef<HTMLDivElement>(null);
    hideDeleteQuestion();
    handleDialog();

    const newItem = editSignal.value.newItem;
    const disableDelete = editSignal.value.disableDelete;
    const DELETE_MARGIN_LEFT_STYLE = {marginLeft: '0.15rem'};
    const isMultiline = editSignal.value.multiline;
    const maxLength = editSignal.value.maxLength || DEFAULT_MAX_INPUT_LENGTH;
    const submitClass = 'character-box-button main-text'
    // const inputClass = isMultiline?  'display-none': 'input-filter';
    const inputClass = getInputClass(!isMultiline);
    // const textAreaClass = !isMultiline?  'display-none': 'input-filter';
    const textAreaClass = getInputClass(isMultiline ?? false);
    const deleteSButtonStyle = isMultiline? DELETE_MARGIN_LEFT_STYLE : {};
    const deleteButtonExtraClass = (newItem || disableDelete)? 'display-none': '';


    const toDeleteLabel = editSignal.value.title || editSignal.value.text.slice(0, LABEL_LENGTH_IF_TITLE_OMITTED);

    return(
        <dialog ref = {dialogRef} className = 'character-box-button padding0'>
            <div className='edit-dialog '>
                <div className = 'closing-button-box closing-dialog-edit'>
                    <button onClick = {handleCloseClick}>&times;</button>
                </div>
                
                <h2>{editSignal.value.title || ''} </h2>

            <div className='edit-dialog-inside' ref = {primaryDivRef}>
                <form id = 'character-edit-form' onSubmit={handleSubmit}>
                    {newItem && <label htmlFor='attribute-input'>Label</label>}
                    <input name = 'attribute-input' ref = {oneLinerRef} type = 'text' id = 'atr-edit-input' className= {inputClass} maxLength={maxLength}/>
                    {newItem && <label htmlFor='attribute-text-area'>Description</label>}
                    <textarea name = 'attribute-text-area' ref = {multiLinerRef} id = 'atr-edit-text-area' className = {textAreaClass} maxLength = {maxLength} />
                    <div className = 'edit-dialog-buttons'>
                        <input type = 'submit' className = {`${submitClass} `} value='submit'/>
                        <button className={`delete-button ${deleteButtonExtraClass}`} style={deleteSButtonStyle} onClick = {showDeleteQuestion}>{'Delete'}</button>

                    </div>
                </form>
            </div>

            <div className = 'spacer' ref = {secondaryDivRef} style = {{display: 'none'}}>
                <span className='are-you-sure-question'>{'Are you sure? This action is irreversible.'}</span>
                
                <div className = 'spacer'>
                    <button className='character-box-button main-text' onClick = {hideDeleteQuestion}>{'No'}</button>
                    <button className='delete-button' style = {DELETE_MARGIN_LEFT_STYLE} onClick = {handleDelete}>{'Yes, delete'} <span>{toDeleteLabel}</span>.</button>
                </div>
            </div>
            </div>
        </dialog>
    )

    function handleCloseClick(){
        if (!dialogRef.current) return;
        if (dialogRef.current.open) dialogRef.current.close();
    }

    function showDeleteQuestion(e: React.FormEvent) {
        e.preventDefault();
        if (!primaryDivRef.current) return;
        if (!secondaryDivRef.current) return;
        primaryDivRef.current.style.display = 'none';
        secondaryDivRef.current.style.display = 'block';
    }

    function hideDeleteQuestion(){
        if (!primaryDivRef.current) return;
        if (!secondaryDivRef.current) return;
        primaryDivRef.current.style.display = 'flex';
        secondaryDivRef.current.style.display = 'none';
    }

    function handleDialog(){
        useSignalEffect(() => {
            if (editSignal.value.title === TITLE_ON_MOUNT_VALUE) return;
            if (!dialogRef.current) return;
            if (!oneLinerRef.current) return;
            if (!multiLinerRef.current) return;
            const isMultiline = editSignal.value.multiline;
            if (isMultiline) multiLinerRef.current.value = editSignal.value.text;
            else oneLinerRef.current.value = editSignal.value.text;
            if (newItem) multiLinerRef.current.value = '';
            if (newItem) oneLinerRef.current.value = '';
            if (dialogRef.current.open) return;
            dialogRef.current.showModal();
            if (isMultiline) multiLinerRef.current.select();
            else oneLinerRef.current.select();
            });
    }

    function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!dialogRef.current) return;
        if (!oneLinerRef.current) return;
        if (!multiLinerRef.current) return;
        dialogRef.current.close();
        const isMultiline = editSignal.value.multiline;
        const content = isMultiline? multiLinerRef.current.value : oneLinerRef.current.value;
        const payload = getEmitPayload(content);
        if (payload.value.length > maxLength) return;
        const socketOrder = newItem? 'new-character-attribute': 'edit-character-attribute';  
        socket.emit(socketOrder, payload);
    }

    function handleDelete(){
        if (!dialogRef.current) return;
        dialogRef.current.close();
        const payload = getEmitPayload();
        socket.emit('delete-character-attribute', payload);
    }

    function getEmitPayload(content?: string){
        if (!oneLinerRef.current) return {value: ''};
        const newLabel = newItem? oneLinerRef.current.value : undefined;
        return {
            userID: usersDataState.value.userID,
            characterID: usersDataState.value.currentCharacterID,
            attributesGroup: editSignal.value.attributesGroup,
            attributeID: editSignal.value.attributeID,
            attributeSection: editSignal.value.attributeSection,
            value: content || '',
            label: newLabel
        };
    }

    function getInputClass(visibleCondition: boolean){
        const VISIBLE_CLASS = 'input-filter';
        const INVISIBLE_CLASS = 'display-none';
        if (newItem) return VISIBLE_CLASS;
        if (visibleCondition) return VISIBLE_CLASS;
        return INVISIBLE_CLASS;
    }


}


export type AttributeEditType = {
    text: string,
    title?: string,
    maxLength: number,
    multiline? : boolean,
    attributesGroup?: string,
    attributeID?: string,
    attributeSection?: string,
    newItem?: boolean,
    disableDelete?: boolean
}

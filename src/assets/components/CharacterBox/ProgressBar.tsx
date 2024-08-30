
import { useRef } from "react";
import { useSocket } from "../../providers/SocketProvider";
import { usersDataState } from "../../states/GlobalState";

export default function ProgressBar({widthRem, value, maxValue, foregroundClassName, label, authorization = true, socketEditKey, id}: props) {
    const socket = useSocket();
    const userID = usersDataState.value.userID;
    const valueCoefficient = getValueCoefficient(value, maxValue);
    const currentValueRef = useRef<HTMLInputElement>(null);
    const maxValueRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const mainDivClassName = authorization? "progress-bar-box pointer" : "progress-bar-box";

    return (
      <>
      <div className = {mainDivClassName} onClick = {authorization? handleClick : function(){}}>
          <div style={{'width' : `${widthRem}rem`}} className="progress-bar-background">
              <div style={{'width' : `${Math.round(valueCoefficient * 100)}%`, }} className={`progress-bar-foreground  ${foregroundClassName}`} />
          </div>
  
          <div className="item-value progress-bar-text">{`${value}/${maxValue}`}</div>
      </div>
      {authorization && <EditDialog/>}
      </>
    )

    function EditDialog(){
      const idSuffix = `hp-${label}_${Math.random()}`;


      return(
        <dialog id = {`dialog-${idSuffix}`} ref = {dialogRef} className = 'character-changer edit-dialog'>
          <form id = {`form-${idSuffix}`} onSubmit={handleFormSubmit}>
            <div>
              <span>Current:</span>
              <input ref = {currentValueRef} maxLength={5} type = 'text' defaultValue={value} className = 'input-filter'/>
            </div>
            <div>
              <span>Max:</span>
              <input ref = {maxValueRef} maxLength={5} type = 'number' defaultValue={maxValue} className = 'input-filter'/>
            </div>
            <input type = 'submit' className="hidden"/>
          </form>
        </dialog>
      )
    }

    function handleClick(){
      if (!dialogRef.current) return;
      if (dialogRef.current.open) return;
      dialogRef.current.showModal();
      if (!currentValueRef.current) return;
      currentValueRef.current.select();
    }

    function handleFormSubmit(e: React.FormEvent){
      e.preventDefault();
      if (!currentValueRef.current || !maxValueRef.current) return;
      const proposedMax = getCheckedInputValue(maxValueRef.current.value) || maxValue;
      const newMax = proposedMax < 0? maxValue : proposedMax;
      const newCurrent = prepareNewCurrentValue(currentValueRef.current.value, newMax) || value;
      socket.emit(socketEditKey, {value: newCurrent, max: newMax, userID: userID, characterID: id});
      if (!dialogRef.current) return;
      if (dialogRef.current.open) dialogRef.current.close();
    }

    function prepareNewCurrentValue(newCurrent: string, newMax: number): number | undefined {
      if (!newCurrent) return;
      const proposed = getCheckedInputValue(newCurrent);
      if (!proposed) return;
      const sign = newCurrent.charAt(0);
      if (sign === '+' || sign === '-') return limitValue(proposed + value, 0, newMax);
      return limitValue(proposed, 0, newMax);

    }

    function getCheckedInputValue(value: string, onlyInteger: boolean = true){
      if (!value) return;
      const valueNumber = Number(value);
      if (Number.isNaN(valueNumber)) return;
      if (!onlyInteger) return valueNumber;
      if (!Number.isInteger(valueNumber)) return;
      return valueNumber;  
    }

    function limitValue(value: number, min: number, max: number){
      return Math.max(min, Math.min(max, value));
    }
  }



  function getValueCoefficient(value: number, maxValue: number){
    if (value <= 0 || maxValue <= 0) return 0;
    if (value >= maxValue) return 1;
    return value / maxValue;
  }
  
  type props = {
      widthRem: number,
      value: number,
      maxValue: number,
      foregroundClassName: string,
      authorization?: boolean,
      label: string,
      socketEditKey: string,
      id: string
  }
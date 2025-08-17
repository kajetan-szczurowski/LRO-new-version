import { useState, useRef } from 'react'
import { useSocket } from '../../../providers/SocketProvider'
import { usersDataState } from '../../../states/GlobalState';
import NumericAndTextSpans from '../../NumericAndTextSpans';
import { characterType } from '../../Map/mapTypes';
import ConditionPicker from './ConditionPicker';
import { signal } from '@preact/signals-react';
import { currentAssetConditionState } from './conditionPickState';
import { ConditionInCart } from './ConditionTypes';
import ConditionsCart from './ConditionsCart';
import { CharacterCondition } from '../../Map/mapTypes';
import AssetCondition from './AssetCondition';

export const assetsBoxConditionCart = signal<ConditionInCart[]>([]);

export default function Assets() {
    const socket = useSocket();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const newNameRef = useRef<HTMLInputElement>(null);

    const userID = usersDataState.value.userID;
    const [assetsList, setAssetsList] = useState<characterType[]>(() => { socket.emit('give-me-assets-data', userID); return [] });

    socket.on('assets-data', payload => setAssetsList(payload));
    socket.on('map-assets', payload => setAssetsList(payload));

    return(
        <>

        <ul>
            {assetsList.map(asset => {
                const label = `${asset.name} (${Math.round(asset.x)}, ${Math.round(asset.y)})`;
                return(
                    <li key = {asset.id} className = ''>
                        <div className = 'asset-wrapper'>
                            <div className = 'asset-wrapper'>
                                <div>
                                    <img src = {asset.graphicUrl} style = {{'width': '100px', 'height': '100px'}}></img>
                                </div>
                                <div className = 'asset-label-button'>
                                    <div><NumericAndTextSpans value = {label} digitsClass = 'numeric-value' nonDigitsClass = 'non-numeric-value'/></div>
                                    <button onClick = {() => handleAddConditionClick(asset.id, asset.name)}>Add condition</button>
                                    <form onSubmit = {(e) => handleNewNameSubmit(e, asset.id)}>
                                        <input ref = {newNameRef} placeholder = 'Type new name'></input>
                                        <input type = 'submit'></input>
                                    </form>
                                </div>
                            </div>

                            <div className = 'assets-current-condition'>
                                <CurrentConditions conditionsInAsset = {asset.conditions} assetID = {asset.id} assetName = {asset.name}/>
                            </div>

                        </div>


                    </li>
                )
            })}
        </ul>
            <NewConditionDialog/>
            <ConditionsCart conditions = {assetsBoxConditionCart.value} handleClickCallback = {() => {}}/>
            <button onClick = {handleOrdersSubmit}>Submit</button>
        </>
    )

    function NewConditionDialog(){
        return(
            <dialog ref = {dialogRef} className = 'character-box-button edit-button condition-picker-dialog'>
                <ConditionPicker callback = {closeDialog}/>
            </dialog>
        )
    }



    function handleAddConditionClick(id: string, name: string){
        currentAssetConditionState.value = {id: id, name: name};
        openDialog();
    }

    function openDialog(){
        if (!dialogRef.current) return;
        if (dialogRef.current.open) return;
        dialogRef.current.showModal();
    }

    function closeDialog(){
        if (!dialogRef.current) return;
        if (dialogRef.current.open) dialogRef.current.close();

    }
   
    function handleOrdersSubmit(){
        const orders = assetsBoxConditionCart.value;
        const payload = {userID: userID, orders: orders};
        socket.emit('edit-condition', payload);
        assetsBoxConditionCart.value = [];
    }

    function CurrentConditions({conditionsInAsset, assetID, assetName}: {conditionsInAsset: CharacterCondition[] | undefined, assetID: string, assetName: string}){
        if (!conditionsInAsset) return(<></>);
        return(
            <>
                {conditionsInAsset.map(cond => {
                    return(
                        <AssetCondition label = {cond.label} force = {cond.force} conditionID = {cond.id}
                         assetID = {assetID} key = {cond.id} assetName = {assetName} onContextMenu = {handleConditionRigthClick}/>
                    )
                })}
            </>
        )
    }

    function handleConditionRigthClick(assetID: string, conditionID: string, assetName: string, force: number, conditionLabel: string){
        const newCart = [...assetsBoxConditionCart.value];
        newCart.push({label: conditionLabel, force: force, assetID: assetID, conditionID: conditionID, command: 'delete', assetName: assetName});
        assetsBoxConditionCart.value = newCart;
    }

    function handleNewNameSubmit(e: React.FormEvent, assetID: string){
        e.preventDefault();
        if (!newNameRef.current) return;
        socket.emit('set-asset-name', {userID: userID, assetID: assetID, newName: newNameRef.current.value});
    }

}



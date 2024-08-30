import {useState, useRef} from 'react'
import { useSocket } from '../../providers/SocketProvider'
import { usersDataState } from '../../states/GlobalState';
import { mapDataState } from '../../states/GlobalState';

export default function MapGraphics() {
    const userID = usersDataState.value.userID;
    const userIsGM = usersDataState.value.isGM;
    const socket = useSocket();
    const [maps, setMaps] = useState<graphicAssetType[]>(() => {socket.emit('get-maps', userID); return []});
    const [assets, setAssets] = useState<graphicAssetType[]>(() => {socket.emit('get-assets', userID); return []});
    const sizeRef = useRef<HTMLInputElement>(null);
    const newAssetNameRef = useRef<HTMLInputElement>(null);
    const newAssetURLRef = useRef<HTMLInputElement>(null);
    const newAssetTypeRef = useRef<HTMLSelectElement>(null);
    const [mapsToAdd, setMapsToAdd] = useState<graphicAssetType[]>([]);
    const [assetsToAdd, setAssetsToAdd] = useState<graphicAssetType[]>([]);


    socket.on('maps', maps => setMaps(maps));
    socket.on('assets', assets => setAssets(assets));

    if (!userIsGM) return(<></>)

    return(
      <>
        <section id = 'admin-box'>
            <ol>
                {maps.map(m => {
                    return(<li key = {m.label} className = 'character-box-clickable' onClick = {() => changeMap(m.url)}>{m.label}</li>)
                })}
            </ol>

            <ol>
                {assets.map(ass => {
                    return(<li key = {ass.label} className = 'character-box-clickable' onClick = {() => addToMap(ass)}>{ass.label}</li>)
                })}
            </ol>

            
            <input ref = {sizeRef}></input>
            <button onClick = {resetSize}>Reset size input</button>

        </section>

        <h2>New Graphics:</h2>
        <AddGraphicForm/>
        <GraphicsToAdd/>

      </>

    )

    function resetSize(){
        if (!sizeRef.current) return;
        sizeRef.current.value = '';
    }

    function getSize(){
        if (!sizeRef.current) return 0;
        const inputValue = Number(sizeRef.current.value);
        if (isNaN(inputValue)) return 0;
        if (inputValue < 0) return 0;
        return inputValue;
    }

    function addToMap(ass: {url: string, label:string}){
        const size = getSize();
        const cords = {...mapDataState.value};
        socket.emit('add-to-map', {userID: userID, assetURL: ass.url, size: size, name: ass.label, x: cords.x, y: cords.y});
    }

    function changeMap(map: string){
        socket.emit('change-map', {userID: userID, mapURL: map});
    }

    function AddGraphicForm(){
        return(
            <form id = 'new-assets-form' onSubmit = {addAssetSubmitHandle}>
                <label htmlFor='new-asset-name'>Label:</label>
                <input name = 'new-asset-name' id = 'new-asset-name-input' ref = {newAssetNameRef}></input>
                <label htmlFor='new-asset-url'>URL:</label>
                <input name = 'new-asset-url' id = 'new-asset-name-url' ref = {newAssetURLRef}></input>
            
                <select ref = {newAssetTypeRef}>
                    <option value='map'>Map</option>
                    <option value='asset'>Asset</option>
                </select>

                <input type = 'submit' />

            </form>
        )
    }

    function addAssetSubmitHandle(e: React.FormEvent){
        e.preventDefault();
        if (!newAssetTypeRef.current || !newAssetNameRef.current || !newAssetURLRef.current) return;
        const newAsset: graphicAssetType = {label: newAssetNameRef.current.value, url: newAssetURLRef.current.value};
        (newAssetTypeRef.current.value ==='map')? setMapsToAdd([...mapsToAdd, newAsset]) : setAssetsToAdd([...assetsToAdd, newAsset]);
    }

    function GraphicsToAdd(){
        if (mapsToAdd.length === 0 && assetsToAdd.length === 0) return(<></>);

        return(
            <>
            <h3>To append:</h3>

            <ul>
            {mapsToAdd.map(oneMap => {
                return(
                <li>
                    <strong>{oneMap.label}</strong>
                    <span>{oneMap.url}</span>
                </li>
            )})}

            {assetsToAdd.map(oneAsset => {
                return(
                <li>
                    <strong>{oneAsset.label}</strong>
                    <span>{oneAsset.url}</span>
                </li>
            )})}
            </ul>

            <button onClick = {uploadAssets}>To the server!</button>
            </>
        )
    }


    function uploadAssets(){
        if (assetsToAdd.length === 0 && maps.length === 0) return;
        const socketDataObject = {
            userID: userID,
            assets: assetsToAdd,
            maps: mapsToAdd
        }

        socket.emit('new-assets', socketDataObject);
        setAssetsToAdd([]);
        setMapsToAdd([]);
    }

}

type graphicAssetType = {
    label: string,
    url: string
}

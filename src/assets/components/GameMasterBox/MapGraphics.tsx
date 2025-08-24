import {useState, useRef} from 'react'
import { useSocket } from '../../providers/SocketProvider'
import { usersDataState } from '../../states/GlobalState';
import { mapDataState } from '../../states/GlobalState';
import { withInputFilter } from '../withInputFilter';

export default function MapGraphics() {
    const userID = usersDataState.value.userID;
    const userIsGM = usersDataState.value.isGM;
    const socket = useSocket();
    const [maps, setMaps] = useState<graphicAssetType[]>(() => {socket.emit('get-maps', userID); return []});
    const [assets, setAssets] = useState<graphicAssetType[]>(() => {socket.emit('get-assets', userID); return []});
    const [showMap, setShowMaps] = useState(false);
    const [showAssets, setShowAssets] = useState(false);
    const sizeRef = useRef<HTMLInputElement>(null);
    const newAssetNameRef = useRef<HTMLInputElement>(null);
    const newAssetURLRef = useRef<HTMLInputElement>(null);
    const newAssetTypeRef = useRef<HTMLSelectElement>(null);
    const [mapsToAdd, setMapsToAdd] = useState<graphicAssetType[]>([]);
    const [assetsToAdd, setAssetsToAdd] = useState<graphicAssetType[]>([]);
    type assetType = {label: string, url: string};


    socket.on('maps', maps => setMaps(maps.sort((a : assetType, b : assetType) => a.label.localeCompare(b.label) )));
    socket.on('assets', assets => setAssets(assets.sort((a : assetType, b : assetType) => a.label.localeCompare(b.label) )));

    const MapsComponent = withInputFilter(MapsList);
    const AssetsComponet = withInputFilter(AssetsList);

    if (!userIsGM) return(<></>)

    return(
      <>
        <section id = 'admin-box'>
            <Header label = 'Maps' callback = {() => setShowMaps(prev => !prev)} />
            <div className = {showMap? '' : 'display-none'}><MapsComponent/></div>

            <Header label = 'Assets' callback = {() => setShowAssets(prev => !prev)} />
            <div className = {showAssets? '' : 'display-none'}><AssetsComponet/></div>
            
            <input ref = {sizeRef}></input>
            <button onClick = {resetSize}>Reset size input</button>

        </section>

        <h2>New Graphics:</h2>
        <AddGraphicForm/>
        <GraphicsToAdd/>

      </>

    )

    function Header({label, callback} : {label: string, callback: Function}){
        return(
            <h2>
                {label} <span onClick = {() => callback()} >{'Show/Hide'} </span>
            </h2>
        )

    }

    function MapsList({filter}: {filter: string}){
        const filteredMaps = maps.filter(m => m.label.toLowerCase().includes(filter.toLowerCase()));
        return(
            <ol>
                {filteredMaps.map(m => {
                    return(<li key = {m.label} className = 'character-box-clickable' onClick = {() => changeMap(m.url)}>{m.label}</li>)
                })}
            </ol>
        )    
    }

        function AssetsList({filter}: {filter: string}){
        const filteredAssets = assets.filter(ass => ass.label.toLowerCase().includes(filter.toLowerCase()));
        return(
            <ol>
                {filteredAssets.map(ass => {
                    return(<li key = {ass.label} className = 'character-box-clickable' onClick = {() => addToMap(ass)}>{ass.label}</li>)
                })}
            </ol>
        )    
    }


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

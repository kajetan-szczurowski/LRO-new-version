import {useState, ChangeEvent} from 'react'
import { useSocket } from '../../providers/SocketProvider'
import { usersDataState } from '../../states/GlobalState';


export default function MapAuthorizations() {
    const socket = useSocket();
    const userID = usersDataState.value.userID;
    const userIsGM = usersDataState.value.isGM;
    const [mapAuthorizations, setMapsAuthorizations] = useState<mapAuthorizationType>(() => {socket.emit('get-map-auths', userID); return {assets: [], authorizationMap: {}}});

    socket.on('map-auths', mapAuthorizations => setMapsAuthorizations(mapAuthorizations));
    if (!userIsGM) return(<></>)

    return(
        <MapAuthorizations/>
    )


    function MapAuthorizations(){
        const authMap = usersDataState.value.namesIDMap;
        return(
            <>
                <h2>Authorizations:</h2>
                <ol>
                    {mapAuthorizations.assets.map(authData => {
                        const currentUser = getDefaultAuth(authData.id);
                       return(
                            <li key = {authData.id}>
                                <strong>{authData.name}</strong>
                                <span>{authData.id}</span>
                                <select onChange={(e: ChangeEvent<HTMLSelectElement>) => handleAuthChange(e, authData.id)} >
                                    {Object.keys(authMap).map(nameId =>{ 
                                        const currentValue = currentUser === authMap[nameId];
                                        return(
                                            <>
                                                {!currentValue && <option key = {nameId}>{authMap[nameId]}</option>};
                                                {currentValue && <option selected key = {nameId}>{authMap[nameId]}</option>};

                                            </>
                                        )})}
                                </select>
                            </li>
                        )
                    })}
                </ol>
            </>
        )
    }

    function getDefaultAuth(assetID: string): string{
        const authMap = mapAuthorizations.authorizationMap;
        const authKeys = Object.keys(authMap);
        for (let key of authKeys) {
            if (authMap[key].includes(assetID)) return usersDataState.value.namesIDMap[key];
        }
        return usersDataState.value.namesIDMap[userID as keyof typeof usersDataState.value.namesIDMap]
        // const authMap = mapAuthorizations.authorizationMap;
        // const authKeys = Object.keys(authMap);
        // return authKeys.find(key => authMap[key].includes(assetID)) || '';
    }

    function handleAuthChange(e: ChangeEvent<HTMLSelectElement>, assetID: string){
        const payload = {
            senderID: userID,
            assetOnMapID: assetID,
            playerID: getUserIdFromName(e.target.value)
        };

        socket.emit('map-new-authorization', payload);
    }

    function getUserIdFromName(userName: string){
        const authMap = usersDataState.value.namesIDMap;
        const authKeys = Object.keys(authMap);
        return authKeys.find(key => authMap[key] === userName);
    }


}


type mapAuthorizationType = {
    assets:  assetOnMapType[],
    authorizationMap: {[key: string]: string[]}
}

type assetOnMapType = {
    name: string,
    id: string
}
import {useState, useRef, useEffect} from 'react'
import { useSocket } from '../../providers/SocketProvider';
import { characterMapSignal } from './CharacterBox';
import { usersDataState } from '../../states/GlobalState';


export default function Login() {
    const SAVED_PASSWORD_KEY = 'LRO-saved-password';
    const defaultPassword = localStorage.getItem(SAVED_PASSWORD_KEY) ?? '';
    const DEFAULT_USERNAME = 'Unknown user';
    const SESSION_STORAGE_KEY = 'LRO-logged-user-ID';
    const loginRef = useRef<HTMLInputElement>(null);
    const idRef = useRef<string>("");
    const socket = useSocket();

    const [userName, setUserName] = useState(DEFAULT_USERNAME);
    const logged = userName !== DEFAULT_USERNAME;


    useEffect(() => {
        const currentID = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!currentID) return;
        socket.emit('login', currentID);
    }, [])

    socket.on('login-succes', (loginData) => {
        const IdToInsert = idRef.current || sessionStorage.getItem(SESSION_STORAGE_KEY);
        localStorage.setItem(SAVED_PASSWORD_KEY, IdToInsert || "");
        sessionStorage.setItem(SESSION_STORAGE_KEY, IdToInsert || "");
        characterMapSignal.value = loginData.authorization;
        setUserName(loginData.userName);
        usersDataState.value = {userID: IdToInsert || '', isGM: loginData.isGM,
            currentCharacterID: usersDataState.value.currentCharacterID, namesIDMap: loginData.nameIDsMap, charactersMap: loginData.authorization};
    })

    return (
        <>
            <div>Hi, {userName}</div>
            {logged && <button className = 'character-box-button' onClick = {handleLogoutButton}>Log out</button>}
            {!logged && <button className = 'character-box-button' onClick = {handleLoginButton}>Expand</button>}
            {!logged && <LoginForm />}
        

        </>
    )

    function LoginForm(){
        return(
            <form id = 'login-form' onSubmit = {handleLoginSubmit}>
                <input id = 'login-input' type = 'password' ref = {loginRef} className='login-disabled' defaultValue={defaultPassword}></input>
            </form>
            )
    }

    function handleLoginSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!loginRef.current) return;
        idRef.current = loginRef.current.value;
        socket.emit('login', loginRef.current.value);
    }

    function handleLoginButton(){
        if (!loginRef.current) return;
        loginRef.current.className = 'login-enabled';
    }

    function handleLogoutButton(){
        sessionStorage.setItem(SESSION_STORAGE_KEY, "");
        characterMapSignal.value = {};
        setUserName(DEFAULT_USERNAME);
        usersDataState.value = {userID: '', isGM: false, currentCharacterID: usersDataState.value.currentCharacterID, namesIDMap: {}, charactersMap: {}};
    }

}

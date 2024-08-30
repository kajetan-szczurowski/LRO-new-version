import {useState, useEffect} from 'react'
import { useSignal, useSignalEffect } from '@preact/signals-react';

export function useLocalStorage<T>(key:string, defaultValue:T){
    return useStorage<T>(key, defaultValue, window.localStorage);
}

export function useSessionStorage<T>(key:string, defaultValue:T){
    return useStorage<T>(key, defaultValue, window.sessionStorage);
}

export function useLocalStorageSignal<T>(key:string, defaultValue:T){
    return useSignalStorage<T>(key, defaultValue, window.localStorage);
}

export function useSessionStorageSignal<T>(key:string, defaultValue:T){
    return useSignalStorage<T>(key, defaultValue, window.sessionStorage);
}

function useStorage<T>(key: string, defaultValue:T, storage:Storage):[T, React.Dispatch<React.SetStateAction<T>>]{
    const [value, setValue] = useState<T>(() => getDefaultValue<T>(key, defaultValue, storage));
    useEffect(() => saveIntoStorage<T>(key, value, storage), [value]);
    return [value, setValue];
}

function useSignalStorage<T>(key: string, defaultValue:T, storage:Storage){
    const storagedData = useSignal<T>(getDefaultValue<T>(key, defaultValue, storage));
    useSignalEffect(function(){saveIntoStorage<T>(key, storagedData.value, storage)});
    return storagedData;
}

function getDefaultValue<T>(key: string, defaultValue:T, storage:Storage){
    const fromStorage:T = readFromStorage(key, storage);
    if (fromStorage !== null) return fromStorage;
    if (typeof defaultValue === "function") return defaultValue();
    return defaultValue;
}

function readFromStorage(key:string, storage:Storage){
    const value = storage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value);
}

function saveIntoStorage<T>(key:string, value: T, storage:Storage){
    if (value === undefined) return storage.removeItem(key);
    storage.setItem(key, JSON.stringify(value));
}
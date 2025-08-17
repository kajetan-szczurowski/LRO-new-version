import { signal } from '@preact/signals-react'

export const usersDataState = signal<userDataType>({userID: '', isGM: false, currentCharacterID: '', namesIDMap: {}, charactersMap: {}, userName: ''});
export const mapDataState = signal<mapDataType>({x: 0, y: 0});

export default function GlobalState() {
  return (
    <>
      
    </>
  )
}

type userDataType = {
    userID: string,
    isGM: boolean,
    currentCharacterID: string,
    namesIDMap: {[key: string]: string},
    charactersMap :characterMap,
    userName: string
}

type mapDataType = {
  x: number,
  y: number
}

type characterMap = {[key: string]: string};

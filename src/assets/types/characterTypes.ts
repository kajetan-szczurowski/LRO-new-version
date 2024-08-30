export type characterDataType = {
    about: aboutCharacterType,
    rolls: characterElementType[],
    id: string,
    name: string,
    avatarURL?: string,
    windows: string[],
}

export type characterElementType = { name: string, value: number | string, family?: string };
export type aboutCharacterType = {
  DCs: characterElementType[],
  abilities: characterElementType[],
  generalInfo: characterElementType[],
  graphic?: string
  traits: string[];
};
export type characterDataType = {
    about: aboutCharacterType,
    rolls: characterElementType[]
}

export type characterElementType = { name: string, value: number | string, family?: string };
type aboutCharacterType = {
  DCs: characterElementType[],
  abilities: characterElementType[],
  generalInfo: characterElementType[],
  traits: string[];
};
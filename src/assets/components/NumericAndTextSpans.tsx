import {useId} from 'react';

export default function NumericAndTextSpans({value, digitsClass, nonDigitsClass}: props) {
    const compiled = compileText();
  return (
    <> 
        {compiled.map(chunk => {
            const className = chunk.numeric? digitsClass : nonDigitsClass;
            return(<span className={className} key = {useId()}>{chunk.value}</span>)
        })}
    </>
  )

  function compileText(){
    const result: compiledTextType[] = [];
    let currentText = "";
    let currentIsNumeric = false;
    const text = typeof value === "string" ? value : String(value);

    for (let char of text){
        const isNumber = !isNaN(Number(char));
        if (currentText.length === 0){
            currentText += char;
            currentIsNumeric = isNumber;
            continue;
        }

        if (!isNumber && !currentIsNumeric){
            currentText += char;
            continue;
        }

        if (!isNumber && currentIsNumeric){
            result.push({numeric: true, value: currentText});
            currentText = char;
            currentIsNumeric = false;
            continue;
        }
        //Non numeric value is done. Only digitis left.
        if (!currentIsNumeric){
            result.push({numeric: false, value: currentText});
            currentText = char;
            currentIsNumeric = true;
            continue;
        }
        //Only numeric left.
        currentText += char;
    }
    if (currentText.length > 0) result.push({numeric: currentIsNumeric, value: currentText});
    return result; 
  }
}

type props = {
    value: string | number | undefined,
    digitsClass: string,
    nonDigitsClass: string
}

type compiledTextType = {
    numeric: boolean,
    value: string
}
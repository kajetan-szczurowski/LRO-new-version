import { useRef } from "react"

export default function Importer() {

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    return(
        <>
        <form onSubmit = {handleSubmit}>
            <textarea ref = {textAreaRef}></textarea>
            <input type = 'submit'/>
        </form>
        </>
    )

    function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        if (!textAreaRef.current) return;
        try{
            // const jsoned = JSON.parse(textAreaRef.current.value);
            // console.log(jsoned);
            const data = textAreaRef.current.value.split('\n');
            for (const d of data){
                if (d.includes(' Dex ') && (d.includes(' Con ')))
                    parseSkills(d)

                if (d.includes(' Fort. ') && (d.includes(' Ref. ')))
                    parseDefences(d)

                if (d.includes('Speed')){
                    parseAttacks(d)
                    break;
                }
            }
        }
        catch(error){
            console.log('error while parsing json');
            console.log(error)
        }
    }

    function parseSkills(raw: string){
        const parsed: {[key:string]: string} = {};
        appendPerception(raw, parsed);
        const rawPreProcessed = raw.substring(raw.indexOf('kills') + 'kills '.length)
        const splited = rawPreProcessed.split(',').map(r => r.trim()).filter(r => r.includes('+') || r.includes('-'));
        if (!splited) return;

        for (const skill of splited){
            appendSkills(skill, parsed);
        }
        console.log(JSON.stringify(parsed, null, '\t'));
    }

    function appendPerception(raw: string, parsed: {[key:string]: string}){
        const cut = raw.substring(0, raw.indexOf(';'));
        appendSkills(cut, parsed);
    }

    function appendSkills(line: string, parsed: {[key:string]: string}){
        const splited = line.trim().split(/([\+|\-][0-9]+)/);
        if (splited.length % 2 !== 0) splited.pop();
        for (let index = 0; index <= splited.length - 2; index += 2){
            parsed[splited[index].trim()] = splited[index + 1].trim();
        }
    }

    function parseDefences(raw: string){
        const parsed: {[key:string]: string} = {};
        const rawPreProcessed = raw.substring(raw.indexOf('Fort.'), raw.indexOf('HP'));
        const splited = rawPreProcessed.split(',');
        if (!splited) return;
        for (const defence of splited) appendSkills(defence, parsed);
        console.log(JSON.stringify(parsed, null, '\t'));
    }

    function parseAttacks(raw: string){
        let temporaryText = raw.substring(raw.indexOf('ft') + 2);
        // const indexOfAttack = raw.search(/([\+]|-)+[0-9]+[ ]*\/[ ]*([\+]|-)+[0-9]+[ ]*\/[ ]*([\+]|-)+[0-9]+/);
        // console.log(rawPreProcessed.substring(indexOfAttack))
        // console.log(rawPreProcessed)
        // const spl1 = rawPreProcessed.split('Melee')
        // console.log(spl1);
      
        const [physicals, workingText] = splitAttacks(temporaryText, /((Ranged)[ ]*[1-3]|(Melee)[ ]*[1-3])/);
        const [magicals, _] = splitAttacks(workingText, /[A-Z]*[a-z]* [A-z][a-z]+ Spells[\*\*]*[ ]*DC[ ]*[-]*[0-9]+,/, 15);
        const merged = {'physic': physicals, 'magic': magicals};
        console.log(merged)
    }

    // function hasPhysicalAttack(textToCheck: string){
    //     const result = textToCheck.match(/([\+]|-)+[0-9]+[ ]*\/[ ]*([\+]|-)+[0-9]+[ ]*\/[ ]*([\+]|-)+[0-9]+/);
    //     if (result) return true;
    //     return false;
    // }

    // function parsePhysicalAttack(raw: string){
    //     const matches = raw.match(/((Ranged)[ ]*[1-3]|(Melee)[ ]*[1-3])/);
    //     if (!matches) return;
    //     let textToProcess = raw;
    //     let currentIndex = 0;
    //     for (const attack of matches){
    //         if (!attack) continue;
    //         currentIndex = textToProcess.indexOf(attack);
    //         textToProcess = s
    //     }

        // const index = raw.search(/((Ranged)[ ]*[1-3]|(Melee)[ ]*[1-3])/);
        // if (index < 0) return;
        // const rawPreProcessed = raw.substring(index);
        // const matches = rawPreProcessed.match(/[0-9]+d[0-9]+( (\+|-) [0-9]+ [A-Z]+)*( [a-z]*)/g);
        // if (!matches) return;
        // let textToProcess = '';
        // let copyOfOriginal = rawPreProcessed;
        // let currentIndex = 0;
        // for (const damage of matches){
        //     currentIndex = copyOfOriginal.indexOf(damage);
        //     console.log(currentIndex)
        //     console.log(textToProcess)
        //     textToProcess += copyOfOriginal.substring(0, currentIndex + damage.length);
        //     copyOfOriginal = copyOfOriginal.substring(currentIndex + damage.length);
        // }
    }

    function splitAttacks(text: string, key: RegExp, searchTextMinimalLength: number = 5):[string[], string]{
        const splited: string[] = [];
        let arrayIndex = 0;
        let temporaryText = text;
        let searchIndex = -1;
        let firstRun = true;
        do{
            searchIndex = temporaryText.search(key);
            if (firstRun && searchIndex < 0){
                return [[], temporaryText];
            }

            if (firstRun && searchIndex > 0){
                temporaryText = temporaryText.substring(searchIndex);
            }

            if (searchIndex === 0){
                splited.push(temporaryText.substring(0, searchTextMinimalLength));
                temporaryText = temporaryText.substring(searchTextMinimalLength);
            }

            if (!firstRun && searchIndex > 0){
                splited[arrayIndex] = splited[arrayIndex] ?? '';
                splited[arrayIndex] += temporaryText.substring(0, searchIndex);
                temporaryText = temporaryText.substring(searchIndex);
                arrayIndex++;   
            }
            
            firstRun = false;
        }while(searchIndex >= 0)

        splited[arrayIndex] += temporaryText
        return [splited, temporaryText];
    }



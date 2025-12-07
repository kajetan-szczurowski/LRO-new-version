export default function AuxilaryCharacterButton({onClickEvent, label} : props) {
    return(
        <button className = 'character-box-button' onClick = {onClickEvent}><Icon/></button>
    )

    function Icon(){
        switch (label){
            case 'refresh': return (<>&#8635;</>)
            case 'gear': return (<>&#9881;</>)
            case 'question': return("?")
            case 'disk': return(<>&#128190;</>);
        }
        return (<></>)
    }

}

type props = {
    onClickEvent: React.MouseEventHandler<HTMLButtonElement>
    label: 'refresh' | 'gear' |'question' | 'disk'
}

export default function ControlsView() {
  const controls: controlType[] = [
    {label: 'Turn Off / Turn on mini map', key: 'Control'},
    {label: 'Start measuring', key: 'R'},
    {label: 'Stop measuring', key: 'T'},
    {label: 'Scroll map', key: '(Hold) Shift'},
    {label: 'Scroll map faster', key: '(Hold) Shift + Left Alt'},
    {label: 'Ping map point', key: 'Double left click'}
  ]


  return (
    <dialog className = 'controls-window'>
        <h2> Map controls: </h2>
        <ul>
            {controls.map(control => OneControl(control))}
        </ul>
    </dialog>
  )
}

function OneControl({label, key}: controlType){
    return(
        <>
            <li className = 'control-item'>
                <div>{label}</div>
                <div>{key}</div>
            </li>
            <hr/>
        </>
        
    )
}

type controlType = {
    label: string,
    key: string
}

export function triggerControlsWindow(){
    const dialogObject: HTMLDialogElement | null = document.querySelector('.controls-window');
    if (!dialogObject) return;
    if (!dialogObject.open) dialogObject.showModal();
  }
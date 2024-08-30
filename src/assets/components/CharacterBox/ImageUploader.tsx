import {useRef, DragEvent, useState} from 'react'

export default function ImageUploader() {
  const legitFormats = ['jpg', 'png', 'jpeg'];
  const categories = ['playableCharacter', 'NPC', 'map', 'background'];
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [toUpload, setToUpload] = useState<image[]>([]);
  // useEffect(() => {console.log('siemano', JSON.stringify(toUpload), toUpload, [1,2,3])}, [toUpload]);
  return (
    <>
    <div className='drop-zone' onDrop = {handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} ref = {dropZoneRef}>{
      <ul>
        <>
        {toUpload.map(img => {
          if (!img) return;
          return(<li>{img.name}</li>)})}
          </>
      </ul>
    }</div>
    <div>
      <CategorySetter />
      <button onClick = {handleSendClick}>Send!</button>
    </div>
    </>

  )

  function handleDragLeave(){
    if (!dropZoneRef.current) return;
    dropZoneRef.current.classList.remove('drop-zone-hover');
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!dropZoneRef.current) return;
    dropZoneRef.current.classList.add('drop-zone-hover');
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const dropped: image[] = [];
    const files = [...e.dataTransfer.files];
    let processedFilesCounter = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        try{
          processedFilesCounter++;
          if (!isFileLegit(file.name)) return;
          const newImg = {name: file.name, content: String(reader.result)};
          dropped.push(newImg);
          if (processedFilesCounter >= files.length) setToUpload(dropped);
         }
         catch(e){
           console.log(e);
         }
        
      }
    });
    
    if (!dropZoneRef.current) return;
    dropZoneRef.current.classList.remove('drop-zone-hover');
  }


  function isFileLegit(name: string){
    const dotIndex = name.lastIndexOf('.');
    if (dotIndex === -1) return false;
    const extension = name.substring(dotIndex + 1).toLowerCase();
    return legitFormats.includes(extension);
  }

  function handleSendClick(){
    if (toUpload.length === 0) return;
    if (!selectRef.current) return;
    const sendData = prepareDataForServer();

    fetch(`http://localhost:3000/visuals`, {
      method: 'POST',
      headers: new Headers({'content-type': 'application/json'}),
      body: JSON.stringify(sendData)
  }).then(response => console.log(response))
}

  function prepareDataForServer(): serverInput {
    const category = selectRef.current?.value ?? '';
    return {category: category, data: toUpload};
  }

  function CategorySetter(){
    return(
      <select ref = {selectRef}>
      {categories.map(cat => {
        return(<option key = {cat}>{cat}</option>)})}
      
      </select>
    )
  }
}



type serverInput = {
  category: string,
  data: image[]
}

type image = {
  name: string,
  content: string
}

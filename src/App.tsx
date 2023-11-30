import CharacterBox from './assets/components/CharacterBox/CharacterBox';
import Chat from './assets/components/Chat/Chat';
import Map from './assets/components/Map/Map';


function App() {

  return (

      <main>
      <section id = "left-side">
        <Map/>
        <Chat/>
      </section>

      <CharacterBox/>
      </main>

    
  )

}






export default App

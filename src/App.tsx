import CharacterBox from './assets/components/CharacterBox/CharacterBox';
import Chat from './assets/components/Chat/Chat';
import Map from './assets/components/Map/Map';
import { SocketProvider } from './assets/providers/SocketProvider';
import Settings from './assets/components/CharacterBox/Settings';
import GlobalState from './assets/states/GlobalState';
import ControlsView from './assets/components/CharacterBox/ControlsView';
import GameStatesWindow from './assets/components/CharacterBox/GameStates/GameStatesWindow';


function App() {

  return (
      <SocketProvider>
      <GlobalState />

        <main>
        <section id = "left-side">
          <Map/>
          <Chat/>
        </section>

        <CharacterBox/>
        <Settings/>
        <ControlsView/>
        <GameStatesWindow/>
        </main>
      </SocketProvider>
    
  )

}


export default App


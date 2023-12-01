# LRO new version - Frontend

This project is a first public commit on my new version of LRO. LRO is a project made for playing tabletop RPG with my friends online. *Link to demo at the bottom of the description.*

**Current version includes:**
 - map with vertical and horizontal scrolling,
 - moving avatar in map,
 - chat window with 3 types of messages,
 - displaying character's properties and modifiers for dice rolls,
 - interactive list of rolls,
 - buttons shortcuts for adding more dices into roll.
 
 **TODO:**
 
 - integration with server,
 - rolling dices,
 - mini map,
 - measuring system for map,
 - changing characters,
 - integration with Clerk auth.
 
 **Tech Stack:**
 
 - Vite,
 - React + TypeScript,
 - Preact signals,
 - Socket IO,
 - Clerk.
 
To check demo version [click here.](https://lro-new-demo.netlify.app) Basic controls below.
 - Click on character on map to activate it. Click to any other place on the map to trigger moving.
 - Move mouse pointer to any of the sides of the map. Hold shift to trigger map scrolling. Add left Alt to boost scrolling.
 - Type anything on the chat input. Press enter to public message. You'll see placeholder message based on your input.
 - Add some dices to roll with the button at the right side on the chat input. You can also write roll order manually with # /dices and constants/ and optionally another # /roll comment/. Examples:
	 1. #d20 - roll 20-sided dice,
	 2. #d20 + 5 - roll 20-sided dice and add 5 to the result,
	 3. #d20 + 5 #Description - roll 20-sided dice and add 5 to the result. Corresponding message includes description. **Current version doesn't support rolling yet. You'll see placeholder roll result.**
 - Select rolls from character box. Search for some roll and click it. Next press enter to send chosen roll order. You can also click the button at the right of chat input to add more dices to roll.
 
 
  **Sources:**

  
 - [Character portait,](https://www.deviantart.com/hyptosis/art/200-Free-RPG-Portraits-for-Your-Game-679241770)
 - [used map,](https://dicegrimorium.com/pirate-port-dnd-battle-map/)
 - [website background.](https://dicegrimorium.com/ancient-pharaohs-tomb-entrance-dnd-battle-map/)

 

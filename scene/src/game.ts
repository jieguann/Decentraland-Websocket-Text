import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { activate } from './switchMaterial'
import { createTextEntity, SimpleMove } from './createText'
import * as utils from '@dcl/ecs-scene-utils'

let socket
let parsed:any
SimpleMove
joinSocketsServer()

export async function joinSocketsServer() {
  // fetch realm data to keep players in different realms separate
  let realm = await getCurrentRealm()
  log(`You are in the realm: `, realm.displayName)
  // connect to ws server
  socket = new WebSocket(
    //'wss://64-225-45-232.nip.io/broadcast/' + realm.displayName
    'ws://localhost:13370/broadcast/' + realm.displayName
  )
  // listen for incoming ws messages
  socket.onmessage = function (event) {
    try {
      //const parsed = JSON.parse(event.data)
      parsed = JSON.parse(event.data)
      log(parsed)
  //     const inputText = parsed.title
  // const scale = 0.3
  // createTextEntity(inputText, new Vector3(scale,scale,scale), Color3.Random(), 30)
      // activate cube referenced in message
      //activate(cubes[parsed.cube])
    } catch (error) {
      log(error)
    }
  }

  //socket.send("Hello from Decentraland!")
  
  
}

const generateText = new Entity()
let i =0
generateText.addComponent(
  
  new utils.Interval(1000, () => {
    
    const scale = 0.3
    
    const inputText = parsed.data[i].text
    createTextEntity(inputText, new Vector3(scale,scale,scale), Color3.Random(), 30)
    i=i+1
    if(i>parsed.data.length-1){
      i=0
    }
    log(i)
    // for(var i=0; i<parsed.data.length; i++){
    //   const inputText = parsed.data[i].text
    //   createTextEntity(inputText, new Vector3(scale,scale,scale), Color3.Random(), 30)
    // }
    //const inputText = parsed.data[0].text
    
    //const inputText = 'input'

    //createTextEntity(inputText, new Vector3(scale,scale,scale), Color3.Random(), 30)
  })
)

// add entity to scene
engine.addEntity(generateText)

// list of all cubes
let cubes: Entity[] = []

// add cubes
for (let i = 0; i < 8; i++) {
  let cube = new Entity()
  cube.addComponent(
    new Transform({
      position: new Vector3(i * 2 + 1, 1, 4),
    })
  )
  cube.addComponent(new BoxShape())
  cube.addComponent(
    new OnPointerDown(
      (e) => {
        // send ws message when clicked
        socket.send(
          JSON.stringify({
            cube: i,
          })
        )
      },
      { button: ActionButton.POINTER, hoverText: 'Activate' }
    )
  )
  engine.addEntity(cube)

  cubes.push(cube)
}

// ground
let floor = new Entity()
floor.addComponent(new GLTFShape('models/FloorBaseGrass.glb'))
floor.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8),
    scale: new Vector3(1.6, 0.1, 1.6),
  })
)
engine.addEntity(floor)

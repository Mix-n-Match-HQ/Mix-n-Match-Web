import { useState, useEffect } from "react";
import "./App.css";
import {
  HuddleClientProvider,
  getHuddleClient,
} from "@huddle01/huddle01-client";

import { useHuddleStore } from "@huddle01/huddle01-client/store";
import PeerVideoAudioElem from "./components/PeerVideoAudioElem";
import MeVideoElem from "./components/MeVideoElem";

import { Client, Databases, ID, Query } from "appwrite";

import Bganim from "./components/lottie/Bganim";

function App() {
  const huddleClient = getHuddleClient("6cf466614f891d0d82f5ad03c58924894ee37accbea11efc08f63bdd0d30dfc9");
  const peersKeys = useHuddleStore((state) => Object.keys(state.peers));
  const lobbyPeers = useHuddleStore((state) => state.lobbyPeers);
  const roomState = useHuddleStore((state) => state.roomState);
  const [renderState, setRenderState] = useState(0)  // 0: Room, 1: Finder , 2: Joining, 3: VideoCall
  const [findStatus, setFindStatus] = useState('Finding your Match')
  const [roomId, setRoomId] = useState('')


  const client = new Client();
  client.setEndpoint('http://128.199.21.161/v1').setProject('63f39db778aec8160013');
  const databases = new Databases(client);

  const handleJoin = async () => {
    try {
      await huddleClient.join(roomId, {
        address: "0x15900c698ee356E6976e5645394F027F0704c8Eb",
        wallet: "",
        ens: "nikhil.eth",
      });

      console.log("joined");
    } catch (error) {
      console.log({ error });
    }
  };

  const handleFind = async () => {
    setRenderState(1)
    const promise = databases.listDocuments('63f46844f0a96c5f739c', '63f46857cf4b38be4adf', [
      Query.equal('status', true),
      Query.limit(1)
    ])

    promise.then(function (response) {
      console.log(response); // Success
      if (response.documents.length > 0) {
        const room = response.documents[0].$id
        databases.updateDocument('63f46844f0a96c5f739c', '63f46857cf4b38be4adf', room, {
          status: false
        });
        setRoomId(room)
        setRenderState(2)
      }
      else {
        const createRoom = databases.createDocument('63f46844f0a96c5f739c', '63f46857cf4b38be4adf', ID.unique(), {
          status: true
        });
        createRoom.then(function (response) {
          console.log('Room Created  ' + response.$id); // Success
          setFindStatus('Hold tight..! Waiting more Paticipants to come online')
          setRoomId(response.$id)
          const subscribe = client.subscribe(['databases.63f46844f0a96c5f739c.collections.63f46857cf4b38be4adf.documents.' + response.$id], response => {
            console.log("subscribed ---> " + response);
            setRenderState(2)
            subscribe();
          });


        }, function (error) {
          console.log(error); // Failure
          setRenderState(0)
        });
      }

    }, function (error) {
      console.log(error); // Failure
      setRenderState(0)
    });
  }

  useEffect(() => {
    huddleClient.allowAllLobbyPeersToJoinRoom();
    console.log("Lobby Peers --> " + lobbyPeers);
  }, [lobbyPeers]);

  // useEffect(() => {
  //   if(peersKeys.length>0){
  //     setRenderState(3)
  //   }
  // }, [peersKeys]);

  //////////////// Render Components ////////////////
  const renderVideoCall = () => {
    return (
      <HuddleClientProvider value={huddleClient}>
        <div>
          <PeerVideoAudioElem key={`peerId-${peersKeys[0]}`} peerIdAtIndex={peersKeys[0]} />
          <MeVideoElem />
          {/* <div className="meetControl">
            <button onClick={handleJoin}>Join Room</button>
            <button onClick={() => huddleClient.enableWebcam()}>
              Enable Webcam
            </button>
            <button onClick={() => huddleClient.disableWebcam()}>
              Disable Webcam
            </button>
            <button onClick={() => huddleClient.allowAllLobbyPeersToJoinRoom()}>
              allowAllLobbyPeersToJoinRoom()
            </button>
          </div> */}
        </div>
      </HuddleClientProvider>
    );
  }
  const renderRoom = () => {
    return (
      <div>
        <center>
          <Bganim/>
          <button onClick={handleFind}>
            Find
          </button>
        </center>
      </div>
    );
  }
  const renderFinder = () => {
    return (
      <div>
        <center>
          <h1>{findStatus}</h1>
          
        </center>
      </div>
    );
  }
  const renderJoining = () => {
    handleJoin();
    setTimeout(() => {  setRenderState(3) }, 4000);
    return (
      <div>
        <center>
          <h1>Joining The Match</h1>
        </center>
      </div>
    );
  }
  const renderSwitch = (states) => {
    switch (states) {
      case 0:
        return renderRoom();
      case 1:
        return renderFinder();
      case 2:
        return renderJoining();
      case 3:
        return renderVideoCall();
      default:
        return renderRoom();
    }
  }

  return (<>
    {renderSwitch(renderState)}
  </>
  );
}

export default App;

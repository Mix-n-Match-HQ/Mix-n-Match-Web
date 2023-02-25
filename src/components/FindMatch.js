import { Client, Databases, ID, Query } from "appwrite";
import { useState } from "react";

const client = new Client();
client.setEndpoint('http://128.199.21.161/v1').setProject('63f39db778aec8160013');
const databases = new Databases(client);

const [status, setStatus] = useState(false);

export const handleFind = async () => {

    const promise = databases.listDocuments('63f46844f0a96c5f739c', '63f46857cf4b38be4adf', [
        Query.equal('status', true),
        Query.limit(1)
    ])
    let roomId = ''
    promise.then(function (response) {
        console.log(response); // Success
        if (response.documents.length > 0) {
            roomId = response.documents[0].$id
            databases.updateDocument('63f46844f0a96c5f739c', '63f46857cf4b38be4adf', roomId, {
                status: false
            });
            setStatus(true);
            console.log("executed");
        }
        else {
            const createRoom = databases.createDocument('63f46844f0a96c5f739c', '63f46857cf4b38be4adf', ID.unique(), {
                status: true
            });

            createRoom.then(function (response) {
                console.log('Room Created  ' + response.$id); // Success
                client.subscribe(['databases.63f46844f0a96c5f739c.collections.63f46857cf4b38be4adf.documents.'+ response.$id], response => {
                    console.log("subscribed ---> "+response);
                });

            }, function (error) {
                console.log(error); // Failure
            });
        }

    }, function (error) {
        console.log(error); // Failure
    });
}

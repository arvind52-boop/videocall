//#1
let client = AgoraRTC.createClient({mode:'rtc', codec:"vp8"})

//#2
let config = {
    appid:'0e3e55ddeb2749b1a99c1bbe7cfefd94',
    token:'007eJxTYCjliLmu1Jpw6a1jW76WgMzFLM+Uhf/vakVeU9sxP/nMrWkKDAapxqmmpikpqUlG5iaWSYaJlpbJhklJqebJaalpKZYm90Ry0xoCGRnCH69hYmSAQBCfg6Egtag4Py8xh4EBAAVaIpk=',
    uid:null,
    channel:'personal',
}
let localTracks = {
    audioTrack:null,
    videoTrack:null
}

//#4 - Want to hold state for users audio and video so user can mute and hide
let localTrackState = {
    audioTrackMuted:false,
    videoTrackMuted:false
}

//#5 - Set remote tracks to store other users
let remoteTracks = {}
let muteEvents = [];

// Buffer to store muted audio
let mutedAudioBuffer = [];


document.getElementById('join-btn').addEventListener('click', async () => {
    config.uid = document.getElementById('username').value
    await joinStreams()
    document.getElementById('join-wrapper').style.display = 'none'
    document.getElementById('footer').style.display = 'flex'
})

document.getElementById('mic-btn').addEventListener('click', async () => {
    const timestamp = new Date().toISOString();
    if (!localTrackState.audioTrackMuted) {
        await localTracks.audioTrack.setMuted(true);
        localTrackState.audioTrackMuted = true;
        muteEvents.push({ event: 'Muted', time: timestamp });
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)';
        // Start capturing audio data when muted
        startCaptureMutedAudio();
    } else {
        await localTracks.audioTrack.setMuted(false);
        localTrackState.audioTrackMuted = false;
        muteEvents.push({ event: 'Unmuted', time: timestamp });
        document.getElementById('mic-btn').style.backgroundColor = '#1f1f1f8e';
        // Stop capturing audio data when unmuted
        stopCaptureMutedAudio();
    }
    updateMuteLogDownloadLink();
});

function updateMuteLogDownloadLink() {
    const muteLogText = muteEvents.map(event => `${event.event} at ${event.time}`).join('\n');
    const blob = new Blob([muteLogText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mute-log.txt';
    link.innerText = 'Download Mute Log';
    const existingLink = document.getElementById('mute-log-link');
    if (existingLink) {
        existingLink.href = url;
    } else {
        link.id = 'mute-log-link';
        document.body.appendChild(link);
    }
}

function startCaptureMutedAudio() {
    // Reset buffer
    mutedAudioBuffer = [];
    // Subscribe to audio data from local audio track
    localTracks.audioTrack.on('player-audio-pcm', (evt) => {
        // Push audio data to buffer when muted
        mutedAudioBuffer.push(evt.data);
    });
}

function stopCaptureMutedAudio() {
    // Unsubscribe from audio data
    localTracks.audioTrack.off('player-audio-pcm');
    // Convert buffer to a Blob object
    const audioBlob = new Blob(mutedAudioBuffer, { type: 'audio/wav' });
    const url = URL.createObjectURL(audioBlob);
    // Create a download link for the captured audio
    const link = document.createElement('a');
    link.href = url;
    link.download = 'muted-audio.wav';
    link.innerText = 'Download Muted Audio';
    document.body.appendChild(link); // Append link to DOM or use an existing container
}



document.getElementById('camera-btn').addEventListener('click', async () => {
    if (!localTrackState.videoTrackMuted) {
        await localTracks.videoTrack.setMuted(true);
        localTrackState.videoTrackMuted = true;
        document.getElementById('camera-btn').classList.add('muted'); // Add styling for muted state
    } else {
        await localTracks.videoTrack.setMuted(false);
        localTrackState.videoTrackMuted = false;
        document.getElementById('camera-btn').classList.remove('muted'); // Remove styling for muted state
    }
});



document.getElementById('leave-btn').addEventListener('click', async () => {
    //Loop threw local tracks and stop them so unpublish event gets triggered, then set to undefined
    //Hide footer
    for (trackName in localTracks){
        let track = localTracks[trackName]
        if(track){
            track.stop()
            track.close()
            localTracks[trackName] = null
        }
    }

    //Leave the channel
    await client.leave()
    document.getElementById('footer').style.display = 'none'
    document.getElementById('user-streams').innerHTML = ''
    document.getElementById('join-wrapper').style.display = 'block'

})




//Method will take all my info and set user stream in frame
let joinStreams = async () => {
    //Is this place hear strategicly or can I add to end of method?
    
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);


    client.enableAudioVolumeIndicator(); // Triggers the "volume-indicator" callback event every two seconds.
    client.on("volume-indicator", function(evt){
        for (let i = 0; evt.length > i; i++){
            let speaker = evt[i].uid
            let volume = evt[i].level
            // if(volume > 0){
            //     document.getElementById(`volume-${speaker}`).src = './assets/volume-on.svg'
            // }else{
            //     document.getElementById(`volume-${speaker}`).src = './assets/volume-off.svg'
            // }
            
        
            
        }
    });

    //#6 - Set and get back tracks for local user
    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await  Promise.all([
        client.join(config.appid, config.channel, config.token ||null, config.uid ||null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()

    ])
    
    //#7 - Create player and add it to player list
    let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${config.uid}" src="./assets/volume-on.svg" /> ${config.uid}</p>
                        <div class="video-player player" id="stream-${config.uid}"></div>
                  </div>`

    document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
    //#8 - Player user stream in div
    localTracks.videoTrack.play(`stream-${config.uid}`)
    

    //#9 Add user to user list of names/ids

    //#10 - Publish my local video tracks to entire channel so everyone can see it
    await client.publish([localTracks.audioTrack, localTracks.videoTrack])

}


let handleUserJoined = async (user, mediaType) => {
    // console.log('Handle user joined')

    //#11 - Add user to list of remote users
    remoteTracks[user.uid] = user

    //#12 Subscribe ro remote users
    await client.subscribe(user, mediaType)
   
    
    if (mediaType === 'video'){
        let player = document.getElementById(`video-wrapper-${user.uid}`)
        // console.log('player:', player)
        if (player != null){
            player.remove()
        }
 
        player = `<div class="video-containers" id="video-wrapper-${user.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${user.uid}" src="./assets/volume-on.svg" /> ${user.uid}</p>
                        <div  class="video-player player" id="stream-${user.uid}"></div>
                      </div>`
        document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
         user.videoTrack.play(`stream-${user.uid}`)

        

          
    }
    

    if (mediaType === 'audio') {
        user.audioTrack.play();
      }
}


let handleUserLeft = (user) => {
    // console.log('Handle user left!')
    //Remove from remote users and remove users video wrapper
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`).remove()
}
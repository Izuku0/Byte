import { View, Text } from 'react-native'
import React from 'react'
import { Video,ResizeMode} from 'expo-av'

const VideoAv = () => {
  return (
    <Video
    source={{uri:Video}}
    className='w-full h-60 rounded-xl mt-3'
    resizeMode={ResizeMode.CONTAIN}
    useNativeControls
    shouldPlay
    onPlaybackStatusUpdate={(status) =>{
     if(status.didJustFinish){
       setplay(false)
     }
    }}
    />
  )
}

export default VideoAv
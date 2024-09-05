import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Bookmark = () => {
  return (
    <SafeAreaView className='bg-primary h-full px-4 py-4'>
      <ScrollView>
          <Text className='text-white text-2xl font-psemibold'>Bookmark</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Bookmark
import React from 'react'
import {useQuery} from '@apollo/react-hooks'
import {INBOX} from '../../context/apollo'
import {NotesGrid} from '../index'
import MessageNote from '../../../assets/icons/Message_Note'

const ReceivedNotesGrid = () => {
  const {loading, error, data} = useQuery(INBOX)

  // FIXME: sort in query
  return (
    <NotesGrid
      data={data && data.inbox.reverse()}
      loading={loading}
      error={error}
      Icon={MessageNote}
    />
  )
}

export default ReceivedNotesGrid
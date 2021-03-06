import React, {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {AuthForm, CreateUserForm} from '../components'
import {Title} from '../components/Typography'
import Logo from '../../assets/icons/Logo_Border.svg'

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginVertical: 20,
  },
})

const Login = () => {
  const [tempUserData, setTempUserData] = useState()

  return (
    <View style={styles.content}>
      {tempUserData ? (
        <CreateUserForm authData={tempUserData} />
      ) : (
        <>
          <Logo style={styles.logo} />
          <Title blue>kindrednotes</Title>
          <AuthForm onSignUp={setTempUserData} />
        </>
      )}
    </View>
  )
}

export default Login

import {useContext, useEffect, useState} from 'react'
import {useMutation, useLazyQuery} from '@apollo/react-hooks'
import {
  AuthContext,
  SIGN_UP,
  LOG_IN,
  GET_ACTIVE_USER,
} from '../context'
import {useAsyncStorage} from '../hooks'

const useAuth = () => {
  const {user, setUser} = useContext(AuthContext)
  const [isLogin, setIsLogin] = useState(false)
  // TODO: gracefully handle network errors
  const [signup, {data: signupData}] = useMutation(SIGN_UP)
  const [login, {data: loginData}] = useMutation(LOG_IN)
  const [localUser, setLocalUser] = useAsyncStorage('kindred-user')
  const [
    hasCompletedWalkthrough,
    setHasCompletedWalkthrough,
  ] = useState(false)
  const [isReturningVisitor, setIsReturningVisitor] = useAsyncStorage(
    'kindred-visitor',
  )
  const [updateUserData, {data: updatedUserData}] = useLazyQuery(
    GET_ACTIVE_USER,
  )

  const logout = () => {
    setUser(null)
    setLocalUser(null)
  }

  const toggleIsLogin = () => setIsLogin(s => !s)

  useEffect(() => {
    if (!user && (signupData || loginData)) {
      if (isLogin && loginData) {
        setUser(loginData.login)
        setLocalUser(loginData.login)
      } else if (!isLogin && signupData) {
        setUser(signupData.signup)
        setLocalUser(signupData.signup)
      }
    }
  }, [user, setUser, signupData, loginData, isLogin, setLocalUser])

  useEffect(() => {
    if (localUser === null && !user) {
      setUser(null)
    }
  }, [localUser])

  useEffect(() => {
    if (localUser || user) {
      updateUserData()
    }
  }, [localUser])

  useEffect(() => {
    if (
      localUser &&
      updatedUserData &&
      JSON.stringify(user?.user) !==
        JSON.stringify(updatedUserData?.me)
    ) {
      setUser({...localUser, user: updatedUserData.me})
      setLocalUser({...localUser, user: updatedUserData.me})
    }
  }, [updatedUserData])

  const onWalkthroughComplete = () => {
    setIsReturningVisitor(true)
    setHasCompletedWalkthrough(true)
  }

  return {
    user,
    loading: user === undefined,
    isLoggedIn: !!user,
    localUser,
    signup,
    logout,
    login,
    toggleIsLogin,
    isLogin,
    setUser,
    setLocalUser,
    isReturningVisitor: hasCompletedWalkthrough || isReturningVisitor,
    onWalkthroughComplete,
  }
}

export default useAuth

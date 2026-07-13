import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { getLocationPath } from '~/utils/authRedirect'

export const useSharedResource = (loader, dependencies) => {
  const currentUser = useSelector(selectCurrentUser)
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState({ status: 'loading', data: null, error: null })

  useEffect(() => {
    let isActive = true
    setState({ status: 'loading', data: null, error: null })

    loader()
      .then((data) => {
        if (isActive) setState({ status: 'success', data, error: null })
      })
      .catch((error) => {
        if (!isActive) return

        const statusCode = error.response?.status
        if (statusCode === 401 && !currentUser) {
          navigate('/login', {
            replace: true,
            state: { from: getLocationPath(location) }
          })
          return
        }

        setState({ status: 'error', data: null, error })
      })

    return () => { isActive = false }
  // The caller provides stable primitive dependencies for its loader.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, currentUser, navigate])

  return state
}

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ChatRedirect = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      // Not logged in, redirect to login
      navigate('/login', { replace: true })
      return
    }

    // Redirect based on user role
    const role = user.role
    if (role === 'CLIENT') {
      navigate(`/client/chat/${id}`, { replace: true })
    } else if (role === 'CONSULTANT') {
      navigate(`/consultant/chat/${id}`, { replace: true })
    } else if (['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      navigate(`/admin/chat/${id}`, { replace: true })
    } else {
      // Unknown role, redirect to home
      navigate('/', { replace: true })
    }
  }, [id, user, navigate])

  return null
}

export default ChatRedirect






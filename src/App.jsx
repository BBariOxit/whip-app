import Board from '~/pages/Boards/_id'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
// import LoginForm from '~/pages/Auth/LoginForm'
// import RegisterForm from '~/pages/Auth/RegisterForm'
import Auth from '~/pages/Auth/Auth'
import AccountVerification from '~/pages/Auth/AccountVerification'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <Routes>
      {/* Redirect Route */}
      <Route path="/" element={
        // Ở đây cần replace giá trị true để nó thay thế route /, có thể hiểu là route
        // / sẽ không còn nằm trong history của Browser
        // Thực hành dễ hiểu hơn bằng cách nhấn Go Home từ trang 404 xong thử quay lại bằng 
        // nút back của trình duyệt giữa 2 trường hợp có replace hoặc không có.
        <Navigate to="/boards/69996f5ffacfa157400e51df" replace={true} />
      } />

      <Route element={<ProtectedRoute user={currentUser} />}> 
        {/* Board details */}
        <Route path="/boards/:boardId" element={<Board />} />
      </Route>

      {/* Authentications */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path='/account/verification' element={<AccountVerification />} />

      {/* Route 404 not found page  */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

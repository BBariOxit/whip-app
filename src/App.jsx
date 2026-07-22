import Board from '~/pages/Boards/_id'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
// import LoginForm from '~/pages/Auth/LoginForm'
// import RegisterForm from '~/pages/Auth/RegisterForm'
import Auth from '~/pages/Auth/Auth'
import AccountVerification from '~/pages/Auth/AccountVerification'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import Settings from '~/pages/Settings/Settings'
import Boards from '~/pages/Boards/index'
import { AcceptInvite } from '~/pages/Workspace/AcceptInvite'
import SharedBoard from '~/pages/Share/SharedBoard'
import SharedCard from '~/pages/Share/SharedCard'
/**
 * Giải pháp Clean Code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới cho truy cập
 * Sử dụng <Outlet /> của react-router-dom để hiển thị các Child Route
 */
const ProtectedRoute = ({ user }) => {
  const location = useLocation()
  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to='/login' replace={true} state={{ from }} />
  }
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
        <Navigate to="/boards" replace={true} />
      } />

      {/* Protected Routes (Hiểu đơn giản trong dự án của chúng ta là những route chỉ cho truy cập
        sau khi đã login) */}
      <Route element={<ProtectedRoute user={currentUser} />}>
        {/* <Outlet /> của react-router-dom sẽ chạy vào các child route trong này */}

        {/* Board details */}
        <Route path="/boards/:boardId" element={<Board />} />
        <Route path="/boards" element={<Boards />} />

        {/* User settings */}
        <Route path='/settings' element={<Navigate to='/settings/account' replace={true} />} />
        <Route path='/settings/account' element={<Settings />} />
        <Route path='/settings/preferences' element={<Navigate to='/settings/account' replace={true} />} />
        <Route path='/settings/security' element={<Settings />} />
        <Route path='/settings/data-privacy' element={<Settings />} />
      </Route>

      {/* Authentications */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/forgot-password" element={<Auth />} />
      <Route path="/reset-password" element={<Auth />} />
      <Route path='/account/verification' element={<AccountVerification />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* Public entry points. Backend RBAC decides whether the resource can be
          viewed as a guest or requires an authenticated board member. */}
      <Route path="/share/boards/:boardId" element={<SharedBoard />} />
      <Route path="/share/cards/:boardId/:cardId" element={<SharedCard />} />

      {/* Route 404 not found page  */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

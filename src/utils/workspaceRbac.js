/**
 * Workspace RBAC Helper Functions
 * 
 * Dùng ở Frontend để tính toán quyền hạn của user hiện tại trong workspace.
 * Mục đích: Ẩn/hiện UI elements (buttons, menus) dựa trên role.
 * 
 * LƯU Ý: Frontend RBAC chỉ để tối ưu UX, KHÔNG dùng để bảo mật.
 * Backend middleware là lớp bảo mật thực sự.
 */

/**
 * Lấy role của user hiện tại trong workspace
 * @param {Object} workspace - Workspace object (từ API response)
 * @param {string} currentUserId - ID của user đang đăng nhập
 * @returns {string|null} 'owner' | 'admin' | 'member' | null
 */
export const getMyWorkspaceRole = (workspace, currentUserId) => {
  if (!workspace?.members || !currentUserId) return null
  const member = workspace.members.find(
    m => (m.userId?.toString?.() || m.userId) === currentUserId.toString()
  )
  return member?.role || null
}

/**
 * Kiểm tra user có phải owner không
 */
export const isWorkspaceOwner = (workspace, currentUserId) => {
  return getMyWorkspaceRole(workspace, currentUserId) === 'owner'
}

/**
 * Kiểm tra user có phải admin trở lên không (admin hoặc owner)
 */
export const isWorkspaceAdminOrAbove = (workspace, currentUserId) => {
  const role = getMyWorkspaceRole(workspace, currentUserId)
  return role === 'owner' || role === 'admin'
}

/**
 * Kiểm tra user có phải member của workspace không (bất kể role)
 */
export const isWorkspaceMember = (workspace, currentUserId) => {
  return getMyWorkspaceRole(workspace, currentUserId) !== null
}

/**
 * Kiểm tra xem actor (người đang dùng) có được phép thao tác lên target member không
 * Dùng cho UI: ẩn/hiện nút Kick, nút đổi Role
 * 
 * @param {string} actorRole - Role của người đang đăng nhập
 * @param {string} targetRole - Role của member bị thao tác
 * @param {string} actorUserId - userId của actor
 * @param {string} targetUserId - userId của target
 * @returns {boolean}
 */
export const canManageMember = (actorRole, targetRole, actorUserId, targetUserId) => {
  // Không được thao tác lên chính mình
  if (actorUserId === targetUserId) return false
  // Không ai đụng được Owner
  if (targetRole === 'owner') return false
  // Member không được thao tác lên ai
  if (actorRole === 'member') return false
  // Admin không được thao tác lên Admin khác
  if (actorRole === 'admin' && targetRole === 'admin') return false
  // Owner + Admin được thao tác lên member (Admin chỉ thao tác lên member)
  return true
}

/**
 * Kiểm tra xem actor có được phép đổi role dropdown cho target không
 * Tương tự canManageMember nhưng thêm check: không được đổi role lên owner
 */
export const canChangeRole = (actorRole, targetRole, actorUserId, targetUserId) => {
  return canManageMember(actorRole, targetRole, actorUserId, targetUserId)
}

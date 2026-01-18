export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

// hàm generatePlaceholderCard: Cách xử lý bug logic thư viện Dnd-kit khi Column là rỗng:
// Phía FE sẽ tự tạo ra một cái card đặc biệt: Placeholder Card, không liên quan tới Back-end
// Card đặc biệt này sẽ được ẩn ở giao diện UI người dùng.
// Cấu trúc Id của cái card này để Unique rất đơn giản, không cần phải làm random phức tạp:
// "columnId-placeholder-card" (mỗi column chỉ có thể có tối đa một cái Placeholder Card)
// Quan trọng khi tạo: phải đầy đủ: (_id, boardId, columnId, FE_PlaceholderCard)
// Kỹ hơn nữa về cách tạo chuẩn ở bước nào thì sẽ ở phần tích hợp API Back-end vào dự án. (bởi vì đây là file mock-data)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}

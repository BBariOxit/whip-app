import axios from "axios"
import { toast } from "react-toastify"
import { interceptorLoadingElements } from "./formatters"

// Khởi tạo một đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án.
const authorizedAxiosInstance = axios.create()

// Thời gian chờ tối đa của 1 request: để 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
// withCredentials: Sẽ cho phép axios tự động gửi cookie trong mỗi request lên BE (phục vụ việc chúng ta 
// sẽ lưu JWT tokens (refresh & access) vào trong httpOnly Cookie của trình duyệt)
authorizedAxiosInstance.defaults.withCredentials = true

// cấu hình interceptor (bộ chặn đánh giữa mọi request và response)
// Interceptor request: can thiệp vào giữa những cái request API gửi đi
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(true)
    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Interceptor response: can thiệp vào những cái response từ API trả về
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(false)
    return response
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    /* Mọi mã http status code nằm ngoài khoảng 200 - 299 sẽ là error và rơi vào đây */

    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(false)

    // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code một lần: Clean Code)
    // console.log error ra là sẽ thấy cấu trúc data dẫn tới message lỗi như dưới đây
    console.log(error)
    let errorMessage = error?.message
    if(error.response?.data?.message) {
      errorMessage = error.response?.data?.message
    }
    // Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình - Ngoại trừ mã 410
    // - GONE phục vụ việc tự động refresh lại token.
    if(error.response?.status !== 410) {
      toast.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
);

export default authorizedAxiosInstance

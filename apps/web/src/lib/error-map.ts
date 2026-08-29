import { ApiError } from './api';

export interface LocalizedError {
  title?: string;
  description: string;
}

/**
 * Bảng tra cứu ánh xạ trực tiếp từ thông điệp tiếng Anh của Backend API sang tiếng Việt trên UI
 */
const EXACT_ERROR_MAP: Record<string, string> = {
  // Xác thực & Tài khoản (Users / Auth)
  'invalid email or password': 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
  'email already in use': 'Địa chỉ email này đã được sử dụng trong hệ thống. Vui lòng chọn email khác hoặc đăng nhập.',
  'user not found': 'Không tìm thấy tài khoản người dùng tương ứng.',
  'invalid token': 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
  'missing bearer token': 'Phiên làm việc chưa được xác thực. Vui lòng đăng nhập.',

  // Tệp tin & Tải lên (CV Upload & Extraction)
  'file is required': 'Vui lòng chọn tệp tài liệu trước khi tiếp tục.',
  'file name is required': 'Tên tệp tin không được để trống.',
  'file is empty or input stream cannot be null': 'Tệp tài liệu tải lên không có nội dung.',
  'file size exceeds 10mb limit': 'Dung lượng tệp vượt quá giới hạn tối đa cho phép (10MB).',
  'unsupported file type. supported types: pdf, docx, doc': 'Định dạng tệp không được hỗ trợ. Vui lòng chọn .PDF, .DOCX hoặc .DOC.',
  'coaching report is not ready yet; wait for analysis to finish': 'Báo cáo phản biện đang được phân tích, vui lòng chờ trong giây lát.',
  'coaching report missing': 'Không tìm thấy dữ liệu báo cáo phản biện cho hồ sơ.',
  'file id not found in db': 'Không tìm thấy mã hồ sơ trong cơ sở dữ liệu.',
  'file not found in storage': 'Tệp tin không tìm thấy trong kho lưu trữ an toàn.',
  'you do not have access to this file': 'Bạn không có quyền truy cập vào hồ sơ này.',

  // Lời khuyên & Mục tiêu (Advice & Snapshots)
  'cần ít nhất 2 lần phân tích trong account để so sánh': 'Cần ít nhất 2 mốc phân tích CV trong tài khoản để so sánh sự tiến bộ.',
  'snapshot not found': 'Không tìm thấy mốc lịch sử phân tích (snapshot) được yêu cầu.',
  'you do not have access to this snapshot': 'Bạn không có quyền truy cập mốc phân tích này.',
  'you do not have access to these snapshots': 'Bạn không có quyền truy cập các mốc phân tích này.',
  'pin not found': 'Không tìm thấy mục tiêu đã ghim.',
  'you do not have access to this pin': 'Bạn không có quyền thao tác trên mục tiêu này.',
  'nothing to update': 'Không có nội dung thay đổi nào được gửi lên.',

  // Lỗi HTTP chung
  'not found': 'Không tìm thấy tài nguyên hoặc hồ sơ được yêu cầu trên hệ thống.',
  'internal server error': 'Máy chủ gặp sự cố trong quá trình xử lý. Vui lòng thử lại sau giây lát.',
  'invalid request body': 'Dữ liệu biểu mẫu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  'invalid path parameters': 'Tham số đường dẫn không hợp lệ.',
  'invalid query parameters': 'Tham số truy vấn không hợp lệ.',
};

/**
 * Bảng tra cứu mã lỗi HTTP tiêu chuẩn sang tiếng Việt
 */
const STATUS_CODE_MAP: Record<number, string> = {
  400: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.',
  401: 'Tài khoản hoặc mật khẩu không chính xác, hoặc phiên làm việc đã hết hạn.',
  403: 'Bạn không có quyền truy cập hoặc thực hiện thao tác này.',
  404: 'Không tìm thấy tài nguyên hoặc hồ sơ được yêu cầu trên hệ thống.',
  409: 'Dữ liệu bị xung đột hoặc đã tồn tại trong hệ thống.',
  413: 'Dung lượng tệp vượt quá giới hạn tối đa cho phép (tối đa 10MB).',
  422: 'Dữ liệu gửi lên không đúng định dạng yêu cầu.',
  429: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.',
  500: 'Máy chủ gặp sự cố trong quá trình xử lý. Vui lòng thử lại sau giây lát.',
  502: 'Cổng kết nối máy chủ dịch vụ phản hồi không hợp lệ.',
  503: 'Hệ thống đang bảo trì hoặc quá tải. Vui lòng quay lại sau.',
  504: 'Hết thời gian phản hồi từ máy chủ xử lý dữ liệu.',
};

/**
 * Ánh xạ lỗi linh hoạt qua pattern regex cho các chuỗi có tham số động hoặc lỗi Zod/Network
 */
function matchPatternError(lower: string): string | null {
  // Lỗi mạng & mất kết nối API Gateway
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('econnrefused') ||
    lower.includes('connection refused') ||
    lower.includes('network request failed') ||
    lower.includes('fetch failed')
  ) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng hoặc khởi động API Gateway.';
  }

  // Lỗi Zod validation
  if (lower.includes('invalid email') && lower.includes('character')) {
    return 'Vui lòng nhập đầy đủ địa chỉ email hợp lệ và mật khẩu.';
  }
  if (lower.includes('invalid email') || lower.includes('invalid_string')) {
    return 'Địa chỉ email không đúng định dạng.';
  }
  if (lower.includes('string must contain at least') || lower.includes('too_small')) {
    return 'Vui lòng điền đầy đủ các trường thông tin bắt buộc.';
  }
  if (lower.includes('password must be at least')) {
    return 'Mật khẩu phải chứa ít nhất 8 ký tự.';
  }
  if (lower.includes('password') && lower.includes('match')) {
    return 'Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập.';
  }

  // Lỗi trích xuất động kèm ID
  if (lower.includes('extraction result not found for file')) {
    return 'Chưa tìm thấy kết quả bóc tách cho hồ sơ này.';
  }
  if (lower.includes('storage') && lower.includes('not found')) {
    return 'Tệp tin không tồn tại hoặc đã bị xoá khỏi kho lưu trữ.';
  }
  if (lower.includes('unsupported') && lower.includes('file')) {
    return 'Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .PDF, .DOCX hoặc .DOC.';
  }
  if (lower.includes('too large') || lower.includes('exceeds')) {
    return 'Dung lượng tệp vượt quá giới hạn tối đa cho phép (tối đa 10MB).';
  }

  return null;
}

/**
 * Chuyển đổi bất kỳ đối tượng lỗi nào (ApiError, Error, string, object) thành thông điệp tiếng Việt thân thiện
 */
export function mapErrorToVietnamese(
  err: unknown,
  fallback = 'Đã xảy ra sự cố không mong muốn. Vui lòng thử lại.',
): string {
  if (!err) return fallback;

  let rawMessage = '';
  let statusCode: number | undefined;

  if (typeof err === 'string') {
    rawMessage = err;
  } else if (err instanceof ApiError) {
    rawMessage = err.message;
    statusCode = err.status || err.errorCode;
  } else if (err instanceof Error) {
    rawMessage = err.message;
  } else if (typeof err === 'object' && err !== null) {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string') rawMessage = record.message;
    if (typeof record.status === 'number') statusCode = record.status;
    else if (typeof record.error_code === 'number') statusCode = record.error_code;
  }

  const trimmed = rawMessage.trim();
  const lower = trimmed.toLowerCase();

  // 1. Ánh xạ trực tiếp từ thông điệp chính xác
  if (EXACT_ERROR_MAP[lower]) {
    return EXACT_ERROR_MAP[lower];
  }

  // 2. Ánh xạ theo mẫu hoa/thường hoặc cắt gọt
  for (const [key, value] of Object.entries(EXACT_ERROR_MAP)) {
    if (lower === key || lower.includes(key)) {
      return value;
    }
  }

  // 3. Ánh xạ theo pattern động (Zod, Network, Storage)
  const patternMatch = matchPatternError(lower);
  if (patternMatch) {
    return patternMatch;
  }

  // 4. Ánh xạ qua mã lỗi HTTP
  if (statusCode && STATUS_CODE_MAP[statusCode]) {
    return STATUS_CODE_MAP[statusCode];
  }

  // 5. Nếu chuỗi đã là tiếng Việt (có dấu) thì giữ nguyên, ngược lại trả về fallback thân thiện
  const hasVietnameseDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    trimmed,
  );
  if (hasVietnameseDiacritics && trimmed.length > 0) {
    return trimmed;
  }

  return fallback;
}

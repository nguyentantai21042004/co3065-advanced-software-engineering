import { toast } from 'sonner';
import { mapErrorToVietnamese } from './error-map';

/**
 * Dịch và chuẩn hoá thông điệp lỗi kỹ thuật sang tiếng Việt tự nhiên, thân thiện thông qua UI Mapping Layer
 */
export function formatErrorMessage(err: unknown, fallback = 'Đã xảy ra sự cố không mong muốn. Vui lòng thử lại.'): string {
  return mapErrorToVietnamese(err, fallback);
}

export const notify = {
  success: (title: string, description?: string) => {
    toast.success(title, { description });
  },
  error: (title: string, descriptionOrError?: unknown) => {
    let desc: string | undefined;
    if (descriptionOrError) {
      desc = formatErrorMessage(descriptionOrError);
    }
    toast.error(title, { description: desc });
  },
  warning: (title: string, description?: string) => {
    toast.warning(title, { description });
  },
  info: (title: string, description?: string) => {
    toast.info(title, { description });
  },
};

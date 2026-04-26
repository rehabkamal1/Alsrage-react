/* global Swal */
export const showAlert = (title, text, icon = 'info') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'حسناً',
    confirmButtonColor: '#4f46e5',
    customClass: {
      popup: 'swal-custom-popup',
    }
  });
};

export const showSuccess = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'ممتاز',
    confirmButtonColor: '#10b981',
    timer: 2000
  });
};

export const showError = (title, text = 'حدث خطأ ما، يرجى المحاولة لاحقاً') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'إغلاق',
    confirmButtonColor: '#ef4444'
  });
};

export const showConfirm = (title, text, confirmText = 'نعم، احذف', cancelText = 'إلغاء') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });
};

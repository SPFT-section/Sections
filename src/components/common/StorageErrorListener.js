import { useEffect } from 'react';
import { STORAGE_ERROR_EVENT } from '../../config/constants';
import { useToastStore } from '../../store/toastStore';

// Mounted once near the root of the app. Turns the low-level
// STORAGE_ERROR_EVENT (dispatched by useLocalStorage on a failed write)
// into a visible toast, so a failed save is never silent.
export const StorageErrorListener = () => {
  const { showToast } = useToastStore();

  useEffect(() => {
    const handleStorageError = () => {
      showToast(
        'บันทึกข้อมูลไม่สำเร็จ พื้นที่จัดเก็บอาจเต็มหรือถูกเบราว์เซอร์บล็อก — การเปลี่ยนแปลงล่าสุดอาจไม่ถูกบันทึกไว้',
        'error',
        6000
      );
    };

    window.addEventListener(STORAGE_ERROR_EVENT, handleStorageError);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, handleStorageError);
  }, [showToast]);

  return null;
};

export default StorageErrorListener;

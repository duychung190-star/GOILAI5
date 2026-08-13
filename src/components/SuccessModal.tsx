import React, { useEffect, useState } from 'react';

export interface SuccessModalData {
  customerName?: string;
  driverName?: string;
  pickup?: string;
  bookingId?: string;
}

interface SuccessModalProps {
  isOpen?: boolean;
  data?: SuccessModalData | null;
  onClose?: () => void;
}

declare global {
  interface Window {
    closeSuccessModal?: () => void;
    showSuccessModal?: (data?: SuccessModalData) => void;
  }
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen: externalIsOpen = false,
  data: externalData,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen);
  const [modalData, setModalData] = useState<SuccessModalData>({
    customerName: 'Quý khách',
    driverName: 'Tài xế D.GO',
    pickup: 'Điểm đón của bạn',
    bookingId: '...'
  });

  useEffect(() => {
    setIsOpen(externalIsOpen);
  }, [externalIsOpen]);

  useEffect(() => {
    if (externalData) {
      setModalData(prev => ({
        customerName: externalData.customerName || prev.customerName || 'Quý khách',
        driverName: externalData.driverName || prev.driverName || 'Tài xế D.GO',
        pickup: externalData.pickup || prev.pickup || 'Điểm đón của bạn',
        bookingId: externalData.bookingId || prev.bookingId || '...'
      }));
    }
  }, [externalData]);

  // Bind global window functions closeSuccessModal and showSuccessModal
  useEffect(() => {
    window.closeSuccessModal = () => {
      setIsOpen(false);
      const modalEl = document.getElementById('successModal');
      if (modalEl) {
        modalEl.classList.add('hidden');
      }
      if (onClose) onClose();
    };

    window.showSuccessModal = (newData?: SuccessModalData) => {
      if (newData) {
        setModalData({
          customerName: newData.customerName || 'Quý khách',
          driverName: newData.driverName || 'Tài xế D.GO',
          pickup: newData.pickup || 'Điểm đón của bạn',
          bookingId: newData.bookingId || '...'
        });
      }
      setIsOpen(true);
      const modalEl = document.getElementById('successModal');
      if (modalEl) {
        modalEl.classList.remove('hidden');
      }
    };

    return () => {
      delete window.closeSuccessModal;
      delete window.showSuccessModal;
    };
  }, [onClose]);

  const handleClose = () => {
    if (window.closeSuccessModal) {
      window.closeSuccessModal();
    } else {
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  return (
    <div
      id="successModal"
      className={`${isOpen ? '' : 'hidden '}fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 transition-opacity`}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative transform transition-all">
        {/* Phần Header với tông màu Vàng - Đen thương hiệu D.GO */}
        <div className="bg-yellow-400 p-6 text-center flex flex-col items-center justify-center">
          {/* Icon Ô tô tối giản, sang trọng */}
          <svg
            className="w-16 h-16 text-gray-900 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8 7h8a2 2 0 012 2v2m-10-4H6a2 2 0 00-2 2v2m16 0v7a2 2 0 01-2 2h-1m-10 0H5a2 2 0 01-2-2v-7m16 0a2 2 0 00-2-2h-1m-10 0H5a2 2 0 00-2 2h1m10 0h1m-11 9a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"
            ></path>
          </svg>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
            Đã có tài xế!
          </h2>
        </div>

        {/* Nội dung thông báo cuốc xe */}
        <div className="p-6 text-gray-700 text-sm space-y-4">
          <p className="text-base">
            Xin chào{' '}
            <span id="popCustomerName" className="font-bold text-gray-900">
              {modalData.customerName || 'Quý khách'}
            </span>
            ,
          </p>
          <p>
            Tài xế{' '}
            <span
              id="popDriverName"
              className="font-bold text-blue-600 text-base uppercase"
            >
              {modalData.driverName || '...'}
            </span>{' '}
            đã nhận đơn và <strong>ĐANG TRÊN ĐƯỜNG</strong> di chuyển đến đón
            bạn!
          </p>

          {/* Khung viền xám chứa thông tin chi tiết */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
            <p className="flex items-start">
              <span className="mr-2">📍</span>{' '}
              <span className="leading-relaxed">
                <strong>Điểm đón:</strong>{' '}
                <span id="popPickup">{modalData.pickup || '...'}</span>
              </span>
            </p>
            <p className="flex items-start">
              <span className="mr-2">🏷</span>{' '}
              <span>
                <strong>Mã cuốc:</strong>{' '}
                <span
                  id="popBookingId"
                  className="font-mono bg-gray-200 px-1 rounded"
                >
                  {modalData.bookingId || '...'}
                </span>
              </span>
            </p>
            <p className="flex items-start">
              <span className="mr-2">📞</span>{' '}
              <span>
                <strong>Hotline hỗ trợ:</strong>{' '}
                <a href="tel:0971999734" className="text-blue-600 font-bold">
                  0971.999.734
                </a>
              </span>
            </p>
          </div>

          <p className="text-center italic text-xs text-gray-500 pt-2">
            Cảm ơn quý khách đã chọn D.GO 247!
          </p>
        </div>

        {/* Nút đóng Popup */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClose}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg active:scale-95 transform cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

import { BookingRequest } from '../types';

export interface SpreadsheetInfo {
  id: string;
  name: string;
  webViewLink: string;
  modifiedTime?: string;
}

export const SPREADSHEET_KEY = 'dgo_connected_spreadsheet_id';
export const SPREADSHEET_LINK_KEY = 'dgo_connected_spreadsheet_link';

/**
 * Creates a new Google Sheet formatted for D.GO 247 Bookings
 */
export const createBookingSpreadsheet = async (
  accessToken: string,
  customTitle?: string
): Promise<SpreadsheetInfo> => {
  const title = customTitle || `D.GO 247 - Quản Lý Đơn Đặt Xe (${new Date().toLocaleDateString('vi-VN')})`;

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: 'Danh Sách Đơn Xe',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'STT' } },
                    { userEnteredValue: { stringValue: 'Mã Đơn' } },
                    { userEnteredValue: { stringValue: 'Thời Gian Đặt' } },
                    { userEnteredValue: { stringValue: 'Khách Hàng' } },
                    { userEnteredValue: { stringValue: 'Số Điện Thoại' } },
                    { userEnteredValue: { stringValue: 'Điểm Đón' } },
                    { userEnteredValue: { stringValue: 'Điểm Đến' } },
                    { userEnteredValue: { stringValue: 'Loại Xe' } },
                    { userEnteredValue: { stringValue: 'Khoảng Cách' } },
                    { userEnteredValue: { stringValue: 'Tổng Tiền' } },
                    { userEnteredValue: { stringValue: 'Ghi Chú' } },
                    { userEnteredValue: { stringValue: 'Trạng Thái' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Không thể tạo Trang Tính Google Sheets');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const webViewLink = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Apply basic formatting to header row (bold, background color)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: data.sheets[0]?.properties?.sheetId || 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.02, green: 0.08, blue: 0.16 }, // dark navy
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  alignment: { horizontal: 'CENTER' },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,alignment)',
            },
          },
        ],
      }),
    });
  } catch (fmtError) {
    console.warn('Formatting header failed, continuing:', fmtError);
  }

  // Save in localStorage for quick access
  localStorage.setItem(SPREADSHEET_KEY, spreadsheetId);
  localStorage.setItem(SPREADSHEET_LINK_KEY, webViewLink);

  return {
    id: spreadsheetId,
    name: title,
    webViewLink,
  };
};

/**
 * Formats a booking row for Google Sheets
 */
const formatBookingRow = (booking: BookingRequest, index: number) => {
  const formattedPrice = typeof booking.totalPrice === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice)
    : (booking.totalPrice || '0 ₫');

  const dateStr = booking.createdAt
    ? new Date(booking.createdAt).toLocaleString('vi-VN')
    : new Date().toLocaleString('vi-VN');

  return [
    index,
    booking.id || `DGO-${Date.now().toString().slice(-6)}`,
    dateStr,
    booking.customerName || 'Khách hàng',
    booking.customerPhone || '',
    booking.pickupAddress || '',
    booking.destinationAddress || '',
    booking.vehicleType || 'Xe 4-7 chỗ',
    `${booking.distanceKm || 0} km`,
    formattedPrice,
    booking.noteForDriver || '',
    (booking.status === 'CONFIRMED' || (booking.status as any) === 'confirmed') ? 'Đã xác nhận' : 'Mới đặt',
  ];
};

/**
 * Appends a single booking to a Google Sheet
 */
export const appendBookingToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  booking: BookingRequest,
  index: number = 1
): Promise<boolean> => {
  const rowValues = formatBookingRow(booking, index);

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Danh Sách Đơn Xe'!A:L:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );

  if (!response.ok) {
    // Try fallback to Sheet1 if sheet title is default
    const fallbackRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:L:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );
    if (!fallbackRes.ok) {
      const errJson = await fallbackRes.json();
      console.error('Error appending booking to Google Sheet:', errJson);
      throw new Error(errJson.error?.message || 'Không thể thêm dữ liệu vào Google Sheets');
    }
  }

  return true;
};

/**
 * Syncs multiple bookings to Google Sheets
 */
export const syncAllBookingsToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  bookings: BookingRequest[]
): Promise<{ successCount: number; failedCount: number }> => {
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < bookings.length; i++) {
    try {
      await appendBookingToSheet(accessToken, spreadsheetId, bookings[i], i + 1);
      successCount++;
    } catch (e) {
      console.error('Failed to sync booking:', bookings[i], e);
      failedCount++;
    }
  }

  return { successCount, failedCount };
};

/**
 * Searches user Google Drive for spreadsheets related to D.GO 247
 */
export const listAppSpreadsheets = async (accessToken: string): Promise<SpreadsheetInfo[]> => {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,modifiedTime)&pageSize=20`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Error listing spreadsheets from Drive');
    return [];
  }

  const data = await response.json();
  return data.files || [];
};

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  X,
  Plus,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  LogOut,
  User,
  Sparkles,
  Link2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  initAuth
} from '../utils/googleAuth';
import {
  createBookingSpreadsheet,
  syncAllBookingsToSheet,
  listAppSpreadsheets,
  SPREADSHEET_KEY,
  SPREADSHEET_LINK_KEY,
  SpreadsheetInfo
} from '../utils/googleSheets';
import { BookingRequest } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingRequest[];
  onAutoSyncChange?: (enabled: boolean) => void;
  isAutoSyncEnabled?: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onAutoSyncChange,
  isAutoSyncEnabled = true
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SpreadsheetInfo | null>(null);
  const [availableSheets, setAvailableSheets] = useState<SpreadsheetInfo[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        loadUserSpreadsheets(token);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Check stored active sheet
  useEffect(() => {
    const storedId = localStorage.getItem(SPREADSHEET_KEY);
    const storedLink = localStorage.getItem(SPREADSHEET_LINK_KEY);
    if (storedId && storedLink) {
      setActiveSheet({
        id: storedId,
        name: 'Trang Tính Đã Kết Nối',
        webViewLink: storedLink
      });
    }
  }, []);

  const loadUserSpreadsheets = async (token: string) => {
    setIsLoadingSheets(true);
    try {
      const sheets = await listAppSpreadsheets(token);
      setAvailableSheets(sheets);
      // If we don't have active sheet set, pick the first one matching D.GO
      const savedId = localStorage.getItem(SPREADSHEET_KEY);
      if (savedId) {
        const found = sheets.find(s => s.id === savedId);
        if (found) {
          setActiveSheet(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        await loadUserSpreadsheets(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Đăng nhập Google thất bại');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setSyncStatus(null);
  };

  const handleCreateSheet = async () => {
    const token = getAccessToken();
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập Google trước');
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);
    try {
      const newSheet = await createBookingSpreadsheet(token);
      setActiveSheet(newSheet);
      setSyncStatus(`Đã tạo thành công trang tính: ${newSheet.name}`);
      await loadUserSpreadsheets(token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi tạo Google Sheet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectSheet = (sheet: SpreadsheetInfo) => {
    setActiveSheet(sheet);
    localStorage.setItem(SPREADSHEET_KEY, sheet.id);
    localStorage.setItem(SPREADSHEET_LINK_KEY, sheet.webViewLink);
    setSyncStatus(`Đã kết nối với ${sheet.name}`);
  };

  const handleSyncAllBookings = async () => {
    const token = getAccessToken();
    if (!token) {
      setErrorMessage('Cần đăng nhập Google để đồng bộ');
      return;
    }
    if (!activeSheet) {
      setErrorMessage('Vui lòng chọn hoặc tạo 1 Trang Tính Google Sheets');
      return;
    }
    if (bookings.length === 0) {
      setSyncStatus('Chưa có đơn hàng nào trong lịch sử để đồng bộ.');
      return;
    }

    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const res = await syncAllBookingsToSheet(token, activeSheet.id, bookings);
      setSyncStatus(`Đồng bộ xong ${res.successCount}/${bookings.length} đơn hàng lên Google Sheets!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi đồng bộ dữ liệu');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Tích Hợp Google Sheets
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Realtime
                </span>
              </h3>
              <p className="text-xs text-slate-400">Tự động xuất & đồng bộ dữ liệu đơn xe D.GO 247 tới Google Sheets (thuelai247@gmail.com)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Error / Status banners */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {syncStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* Section 1: Auth State */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tài khoản Google</span>
              {currentUser && (
                <button
                  onClick={handleSignOut}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-normal lowercase"
                >
                  <LogOut className="w-3 h-3" />
                  Đăng xuất
                </button>
              )}
            </div>

            {!currentUser ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Đăng nhập tài khoản Google (<strong className="text-emerald-400 font-semibold">thuelai247@gmail.com</strong>) để cho phép D.GO 247 tự động ghi & đồng bộ trực tiếp đơn xe vào Trang Tính Google Sheets.
                </p>

                {/* Google Standard Sign-in Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full h-11 px-4 bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-3 border border-slate-300 active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="font-semibold text-slate-800">
                    {isSigningIn ? 'Đang kết nối Google...' : 'Đăng nhập bằng Google'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {currentUser.displayName || 'Khách hàng Google'}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Connected Spreadsheet */}
          {currentUser && (
            <div className="space-y-4">
              
              {/* Active Sheet Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Trang Tính Đang Chọn</span>
                  {activeSheet && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Đã kết nối
                    </span>
                  )}
                </div>

                {activeSheet ? (
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{activeSheet.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{activeSheet.id}</div>
                    </div>
                    <a
                      href={activeSheet.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30 transition-colors"
                    >
                      <span>Mở Trang Tính</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-2 text-center">
                    Chưa kết nối Trang Tính nào. Bấm nút dưới đây để tạo mới tự động.
                  </div>
                )}

                {/* Actions: Create or Sync */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleCreateSheet}
                    disabled={isCreating}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all border border-emerald-400/30 active:scale-95"
                  >
                    {isCreating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Tạo Trang Tính Mới</span>
                  </button>

                  <button
                    onClick={handleSyncAllBookings}
                    disabled={isSyncing || !activeSheet}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all active:scale-95"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-sky-400" />
                    )}
                    <span>Đồng Bộ {bookings.length} Đơn Hiện Có</span>
                  </button>
                </div>
              </div>

              {/* Auto sync option */}
              {onAutoSyncChange && (
                <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-200">Tự động đồng bộ đơn mới</div>
                    <div className="text-[11px] text-slate-400">
                      Mỗi khi khách đặt xe trên ứng dụng, thông tin sẽ được tự động ghi vào Trang Tính.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAutoSyncEnabled}
                    onChange={(e) => onAutoSyncChange(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                  />
                </label>
              )}

              {/* Available Drive Sheets list */}
              {availableSheets.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Các Trang Tính Trên Google Drive Của Bạn
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {availableSheets.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSheet(s)}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          activeSheet?.id === s.id
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          <span className="truncate">{s.name}</span>
                        </div>
                        {activeSheet?.id === s.id && (
                          <span className="text-[10px] font-bold text-emerald-400 shrink-0 ml-2">Đang dùng</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Workspace Sheets API v4</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

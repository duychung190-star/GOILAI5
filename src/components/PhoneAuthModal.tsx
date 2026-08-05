import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Phone, User, ShieldCheck, X, Award, Sparkles, CheckCircle2, ArrowRight, LogOut, Lock, KeyRound, PhoneCall, HelpCircle, AlertCircle } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'PROFILE';

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');

  // Form Fields State
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [newPassword, setNewPassword] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setMode('PROFILE');
      setPhone(user.phone || '');
      setName(user.name || '');
    } else {
      if (mode === 'PROFILE') setMode('LOGIN');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Validate Vietnamese phone number format
  const validatePhone = (p: string) => {
    const clean = p.trim().replace(/\D/g, '');
    if (/^(03|05|07|08|09)\d{8}$/.test(clean)) return true;
    if (/^84(3|5|7|8|9)\d{8}$/.test(clean)) return true;
    return clean.length >= 9 && clean.length <= 11;
  };

  // 1. Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || name.trim().length < 2) {
      setErrorMsg('Vui lòng nhập Họ và Tên hợp lệ (ít nhất 2 ký tự)');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('Số điện thoại không đúng định dạng Việt Nam. Ví dụ: 0971999734');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('Bạn cần tích chọn đồng ý với Điều khoản dịch vụ & Chính sách bảo mật của D.GO');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          password,
          confirmPassword,
          agreedTerms
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('dgo_token', data.token);
        }
        localStorage.setItem('dgo_customer_name', data.user.name);
        localStorage.setItem('dgo_customer_phone', data.user.phone);
        
        onLoginSuccess(data.user);
        setSuccessMsg(data.message || 'Đăng ký tài khoản thành công!');
        setMode('PROFILE');
      } else {
        setErrorMsg(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validatePhone(phone)) {
      setErrorMsg('Số điện thoại không đúng định dạng Việt Nam (VD: 0971999734)');
      return;
    }

    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('dgo_token', data.token);
        }
        localStorage.setItem('dgo_customer_name', data.user.name);
        localStorage.setItem('dgo_customer_phone', data.user.phone);

        onLoginSuccess(data.user);
        setSuccessMsg('Đăng nhập thành công!');
        setMode('PROFILE');
      } else {
        setErrorMsg(data.message || 'Số điện thoại hoặc mật khẩu không chính xác');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validatePhone(phone)) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || 'Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.');
        setPassword(newPassword);
        setMode('LOGIN');
      } else {
        setErrorMsg(data.message || 'Không thể đặt lại mật khẩu.');
      }
    } catch (err: any) {
      setErrorMsg('Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'KIM CƯƠNG':
        return { label: 'Thành Viên Kim Cương', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50', icon: '💎' };
      case 'VIP':
        return { label: 'Thành Viên VIP', bg: 'bg-purple-500/20 text-purple-300 border-purple-400/50', icon: '👑' };
      case 'THÂN THIẾT':
        return { label: 'Khách Hàng Thân Thiết', bg: 'bg-amber-500/20 text-amber-300 border-amber-400/50', icon: '⭐' };
      default:
        return { label: 'Thành Viên Mới', bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: '🌱' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col relative max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={dgoLogoImg}
              alt="D.GO Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full border border-amber-400/50 shadow"
            />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>D.GO Customer Account</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-extrabold border border-amber-500/30">
                  247 AUTH
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Đăng Nhập / Đăng Ký SĐT • Tự động Tích Điểm VIP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher for non-profile states */}
        {mode !== 'PROFILE' && (
          <div className="flex border-b border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-400 shrink-0">
            <button
              onClick={() => { setMode('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center border-b-2 transition-all ${
                mode === 'LOGIN'
                  ? 'border-amber-400 text-amber-400 bg-slate-900 font-extrabold'
                  : 'border-transparent hover:text-slate-200'
              }`}
            >
              ĐĂNG NHẬP
            </button>
            <button
              onClick={() => { setMode('REGISTER'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center border-b-2 transition-all ${
                mode === 'REGISTER'
                  ? 'border-amber-400 text-amber-400 bg-slate-900 font-extrabold'
                  : 'border-transparent hover:text-slate-200'
              }`}
            >
              ĐĂNG KÝ MỚI
            </button>
            <button
              onClick={() => { setMode('FORGOT'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center border-b-2 transition-all ${
                mode === 'FORGOT'
                  ? 'border-amber-400 text-amber-400 bg-slate-900 font-extrabold'
                  : 'border-transparent hover:text-slate-200'
              }`}
            >
              QUÊN MẬT KHẨU
            </button>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-200 font-medium flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-medium flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="text-center space-y-1">
                <div className="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400 border border-amber-500/20">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Đăng Nhập Tài Khoản Khách Hàng</h4>
                <p className="text-xs text-slate-400">Nhập Số điện thoại & Mật khẩu đã đăng ký</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Số điện thoại của bạn
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0971999734"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('FORGOT'); setErrorMsg(''); }}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Đang xử lý...' : 'ĐĂNG NHẬP NGAY'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-slate-400 pt-1">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('REGISTER'); setErrorMsg(''); }}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Đăng ký tài khoản mới ➔
                  </button>
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 bg-transparent text-slate-400 hover:text-slate-200 font-bold text-xs text-center"
                >
                  Bỏ qua, đặt xe không cần đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="text-center space-y-1">
                <div className="w-11 h-11 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Tạo Tài Khoản Khách Hàng Mới</h4>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-extrabold border border-amber-500/30">
                  <Sparkles className="w-3 h-3" />
                  <span>TẶNG NGAY VOUCHER GIẢM 10% CUỐC ĐẦU</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Họ và tên khách hàng <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Minh"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Số điện thoại liên hệ <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0971999734"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    Mật khẩu <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    Nhắc lại mật khẩu <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Compliance Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400 shrink-0"
                  />
                  <span className="text-[11px] text-slate-300 leading-snug">
                    Tôi đồng ý với <strong className="text-amber-300">Điều khoản dịch vụ</strong> và <strong className="text-amber-300">Chính sách bảo mật thông tin cá nhân</strong> của D.GO.
                  </span>
                </label>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'HOÀN TẤT ĐĂNG KÝ TÀI KHOẢN'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-slate-400 pt-1">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('LOGIN'); setErrorMsg(''); }}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Đăng nhập ngay ➔
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {mode === 'FORGOT' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-11 h-11 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-400 border border-rose-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Quên Mật Khẩu Đăng Nhập</h4>
                <p className="text-xs text-slate-400">Đặt lại mật khẩu trực tuyến hoặc gọi Hotline tổng đài hỗ trợ 24/7</p>
              </div>

              {/* Option A: Fast Call Hotline */}
              <div className="bg-gradient-to-r from-amber-500/10 to-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Cách 1: Hỗ trợ cấp lại nhanh qua Hotline</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Quý khách vui lòng gọi tới Tổng đài D.GO 247 để tổng đài viên cấp lại mật khẩu ngay trong 1 phút.
                </p>
                <a
                  href="tel:0877683536"
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>GỌI HOTLINE 0877.68.35.36 (MIỄN PHÍ)</span>
                </a>
              </div>

              {/* Option B: Direct Reset Password Form */}
              <form onSubmit={handleResetPassword} className="space-y-3 pt-1">
                <p className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1">
                  Cách 2: Tự đặt lại mật khẩu bằng Số điện thoại
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    Số điện thoại đã đăng ký
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0971999734"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    Mật khẩu mới mong muốn
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg"
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'ĐẶT LẠI MẬT KHẨU'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: USER PROFILE & CUSTOMER LOYALTY CARD */}
          {mode === 'PROFILE' && user && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* VIP Card Display */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-4 rounded-2xl border border-amber-500/30 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-extrabold text-lg flex items-center justify-center shadow-md">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'K'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{user.name}</h4>
                      <p className="text-xs text-amber-300/90 font-mono">{user.phone}</p>
                    </div>
                  </div>
                  {(() => {
                    const badge = getTierBadge(user.tier);
                    return (
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${badge.bg} flex items-center gap-1`}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}
                </div>

                {/* Loyalty Score Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Số chuyến</span>
                    </p>
                    <p className="text-base font-extrabold text-white mt-0.5">{user.tripsCount}</p>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>Độ trung thành</span>
                    </p>
                    <p className="text-base font-extrabold text-amber-400 mt-0.5">
                      {user.loyaltyScorePercent}%
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Điểm thưởng</span>
                    </p>
                    <p className="text-base font-extrabold text-cyan-300 mt-0.5">{user.loyaltyPoints} P</p>
                  </div>
                </div>

                {/* Loyalty Tier Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-400">Tiến trình nâng hạng VIP</span>
                    <span className="text-amber-400">{user.tripsCount}/5 chuyến</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user.tripsCount / 5) * 100)}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Persistent Auto-Fill Alert */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs space-y-1">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã bật Tự động điền (Auto-fill) Đặt xe nhanh!</span>
                </p>
                <p className="text-[11px] text-slate-300 pl-5">
                  Mỗi lần mở web `goilai247.com`, thông tin <strong>{user.name} ({user.phone})</strong> sẽ tự động điền sẵn vào đơn đặt xe.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onLogout}
                  className="w-1/3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-2/3 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors"
                >
                  QUAY LẠI MÀN HÌNH ĐẶT XE
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

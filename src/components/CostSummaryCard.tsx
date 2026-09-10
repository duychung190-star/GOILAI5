import React, { useState } from 'react';
import { PriceBreakdown, VehicleTypeOption } from '../types';
import { PriceCalculator } from '../utils/PriceCalculator';
import { useLanguage } from '../i18n/LanguageContext';
import { CheckCircle, PhoneCall, MessageCircle, AlertCircle, Moon, ShieldCheck, ArrowRight, FileText, Tag, Sparkles } from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface CostSummaryCardProps {
  breakdown: PriceBreakdown;
  vehicleType: VehicleTypeOption;
  needVat: boolean;
  isSubmitting: boolean;
  isCalculatingRoute?: boolean;
  onConfirmBooking: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenPriceTable?: () => void;
  isAsPerPriceTable?: boolean;
}

export const CostSummaryCard: React.FC<CostSummaryCardProps> = ({
  breakdown,
  vehicleType,
  needVat,
  isSubmitting,
  isCalculatingRoute,
  onConfirmBooking,
  onOpenPrivacyPolicy,
  onOpenPriceTable,
  isAsPerPriceTable = false,
}) => {
  const { t } = useLanguage();
  const [showInternalPrivacy, setShowInternalPrivacy] = useState(false);
  const isEffectivePriceTable = breakdown.isAsPerPriceTable || isAsPerPriceTable;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-lg shadow-slate-200/50 space-y-5 relative overflow-hidden">
      
      {/* Top Banner Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{t.summary.title}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEffectivePriceTable ? 'Lộ trình nhiều điểm dừng / Chưa có điểm đến cụ thể' : t.summary.routeSummary}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {isEffectivePriceTable && (
            <span className="px-3 py-1 text-xs font-black text-slate-950 bg-amber-400 rounded-full border border-amber-500 shadow-sm uppercase tracking-wider">
              ĐI THEO BẢNG GIÁ
            </span>
          )}
          <span className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full border border-amber-300">
            {vehicleType}
          </span>
        </div>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-3 text-sm">
        
        {/* Distance & Est Duration */}
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-slate-500">{t.summary.distance}:</span>
          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
            {isEffectivePriceTable ? (
              <span className="text-amber-950 font-bold flex items-center gap-1.5 flex-wrap">
                <span>Đi nhiều điểm —</span>
                <span className="bg-amber-300 text-slate-950 px-2 py-0.5 rounded font-black uppercase text-[11px] border border-amber-400">
                  ĐI THEO BẢNG GIÁ
                </span>
              </span>
            ) : isCalculatingRoute ? (
              <span className="inline-flex items-center gap-1.5 text-blue-600 animate-pulse text-xs">
                <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                <span>Đang tính đường đường bộ...</span>
              </span>
            ) : breakdown.isDaily ? (
              `${breakdown.dailyDays || 1} ngày (24h/ngày)`
            ) : breakdown.isHourly ? (
              `${breakdown.hourlyHours} giờ`
            ) : breakdown.distanceKm > 0 ? (
              `${breakdown.distanceKm} km (~ ${breakdown.estimatedMinutes} ${t.form.estimatedDuration})`
            ) : (
              t.form.enterAddressPrompt
            )}
          </span>
        </div>

        {/* Base Service Fee */}
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-slate-500">
            {isEffectivePriceTable ? 'Phương thức tính cước:' : `${t.summary.basePrice}:`}
          </span>
          <span className="font-semibold text-slate-900">
            {isEffectivePriceTable ? (
              <span className="text-amber-950 font-black uppercase bg-amber-100 px-2 py-0.5 rounded border border-amber-300 text-xs">
                TÍNH THEO BẢNG GIÁ NIÊM YẾT KHI KẾT THÚC
              </span>
            ) : breakdown.basePrice > 0 ? (
              PriceCalculator.formatCurrency(breakdown.basePrice)
            ) : (
              '0 VNĐ'
            )}
          </span>
        </div>

        {/* Night Surcharge (if active & not price table) */}
        {!isEffectivePriceTable && breakdown.nightPercent > 0 && (
          <div className="flex items-center justify-between text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Moon className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{t.summary.nightSurcharge} ({breakdown.nightPercent}%):</span>
            </span>
            <span className="font-bold text-amber-700">
              +{PriceCalculator.formatCurrency(breakdown.nightSurcharge)}
            </span>
          </div>
        )}

        {/* VAT 8% (if enabled & not price table) */}
        {!isEffectivePriceTable && needVat && (
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-slate-500">{t.summary.vatFee}:</span>
            <span className="font-semibold text-amber-700">
              +{PriceCalculator.formatCurrency(breakdown.vatAmount)}
            </span>
          </div>
        )}

        {/* Original Price & Discount Section (Standard mode) */}
        {!isEffectivePriceTable && breakdown.discountAmount > 0 ? (
          <>
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 text-slate-700">
              <span className="text-slate-600 font-medium text-xs sm:text-sm">Giá gốc cước xe:</span>
              <span className="font-bold text-slate-800 text-sm line-through decoration-slate-400">
                {PriceCalculator.formatCurrency(breakdown.originalPrice || breakdown.totalBeforeVat)}
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                  {breakdown.promoCode}
                </span>
                <div className="text-xs">
                  <p className="font-bold text-emerald-800">{breakdown.discountCodeName || 'Mã ưu đãi'}:</p>
                  <p className="text-[10px] text-emerald-600">Đã áp dụng mã voucher giảm giá</p>
                </div>
              </div>
              <span className="font-black text-emerald-700 text-sm sm:text-base shrink-0">
                -{PriceCalculator.formatCurrency(breakdown.discountAmount)}
              </span>
            </div>
          </>
        ) : null}

        {/* Total Price Banner OR Price Table & Voucher Display */}
        {isEffectivePriceTable ? (
          <div className="pt-2 border-t border-slate-200 space-y-3">
            {/* Banner: Đi theo bảng giá */}
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-orange-50 p-4 rounded-xl border border-amber-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5 flex-wrap">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>HÌNH THỨC:</span>
                    <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-lg border border-amber-500 shadow-sm font-black">
                      ĐI THEO BẢNG GIÁ NIÊM YẾT
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-700 font-medium mt-1">
                    Lộ trình linh hoạt theo nhu cầu thực tế • <strong className="text-amber-900">Phí chờ 40.000đ/30 phút</strong>.
                  </p>
                </div>

                {onOpenPriceTable && (
                  <button
                    type="button"
                    onClick={onOpenPriceTable}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    <FileText className="w-4 h-4 text-slate-950" />
                    <span>Xem BẢNG GIÁ</span>
                  </button>
                )}
              </div>

              {/* Special Voucher Card for Price Table mode */}
              <div className="bg-white/90 p-3 rounded-xl border border-emerald-300 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ưu đãi sau chuyến đi:</span>
                  </span>
                  <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md tracking-wider shadow-2xs">
                    MÃ: DGO10 (-10%)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Xuất trình mã <strong>DGO10</strong> cho tài xế hoặc bộ phận điều hành để được <strong>giảm ngay 10%</strong> trên tổng cước thực tế khi kết thúc chuyến đi!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Mode Total Price Banner */
          <div className="pt-2 border-t border-slate-200">
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/90 to-amber-50 p-4 rounded-xl border border-amber-300 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-900">GIÁ PHẢI THANH TOÁN</p>
                  {breakdown.discountAmount > 0 && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Mã: {breakdown.promoCode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {breakdown.discountAmount > 0 ? (
                    <>Giá gốc {PriceCalculator.formatCurrency(breakdown.originalPrice)} → <strong className="text-emerald-700">Tiết kiệm {PriceCalculator.formatCurrency(breakdown.discountAmount)}</strong></>
                  ) : (
                    <span>Giá cước niêm yết chính xác</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
                  {PriceCalculator.formatCurrency(breakdown.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Banner Đặt xe đi tỉnh, đường dài */}
      <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400 rounded-xl shadow-xs space-y-2.5 animate-fadeIn">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs mt-0.5">
            <PhoneCall className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-amber-950 uppercase leading-snug tracking-wide">
              QUÝ KHÁCH CẦN ĐẶT TÀI XẾ ĐI TỈNH, ĐƯỜNG DÀI VUI LÒNG LIÊN HỆ TRỰC TIẾP ĐỂ ĐƯỢC HỖ TRỢ TƯ VẤN GIÁ TỐT NHẤT
            </p>
            <p className="text-[11px] text-slate-600 font-semibold mt-1">
              Tư vấn trực tiếp 24/7 • Hotline: <span className="font-bold text-amber-900">0877.683.536</span>
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-amber-200/80 flex items-center justify-end">
          <a
            href="tel:0877683536"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl border border-amber-500 shadow-sm transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 fill-slate-950" />
            <span>GỌI NGAY</span>
          </a>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-2.5 pt-2">
        
        {/* Button 1: XÁC NHẬN ĐẶT XE NGAY (Primary) */}
        <button
          type="button"
          onClick={onConfirmBooking}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 text-base border border-amber-300 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></span>
              ...
            </span>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 fill-slate-950 text-amber-400" />
              <span>{t.modals.btnConfirm}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Small Privacy Policy Button right below the main booking button */}
        <div className="flex items-center justify-center pt-0.5 pb-1">
          <button
            type="button"
            onClick={() => {
              if (onOpenPrivacyPolicy) {
                onOpenPrivacyPolicy();
              } else {
                setShowInternalPrivacy(true);
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-amber-50/80 active:scale-95 border border-transparent hover:border-amber-200"
            title="Xem Chính sách bảo mật thông tin D.GO GOILAI247"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="underline decoration-slate-300 underline-offset-2 hover:decoration-amber-500 font-medium">Chính sách bảo mật</span>
          </button>
        </div>

        {/* Secondary Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          {/* Button 2: GỌI TƯ VẤN TRỰC TIẾP */}
          <a
            href="tel:0877683536"
            className="w-full py-3 px-3 rounded-xl font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all border border-slate-300 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{t.common.callHotline}</span>
          </a>

          {/* Button 3: LIÊN HỆ QUA ZALO */}
          <a
            href="https://zalo.me/0877683536"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all border border-blue-500 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>{t.common.chatZalo} 0877.683.536</span>
          </a>

        </div>

      </div>

      <PrivacyPolicyModal
        isOpen={showInternalPrivacy}
        onClose={() => setShowInternalPrivacy(false)}
      />

    </div>
  );
};


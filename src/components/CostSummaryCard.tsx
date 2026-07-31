import React from 'react';
import { PriceBreakdown, VehicleTypeOption } from '../types';
import { PriceCalculator } from '../utils/PriceCalculator';
import { useLanguage } from '../i18n/LanguageContext';
import { CheckCircle, PhoneCall, MessageCircle, AlertCircle, Info, Moon, ShieldCheck, ArrowRight } from 'lucide-react';

interface CostSummaryCardProps {
  breakdown: PriceBreakdown;
  vehicleType: VehicleTypeOption;
  needVat: boolean;
  isSubmitting: boolean;
  onConfirmBooking: () => void;
}

export const CostSummaryCard: React.FC<CostSummaryCardProps> = ({
  breakdown,
  vehicleType,
  needVat,
  isSubmitting,
  onConfirmBooking
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-900 rounded-2xl border border-amber-500/30 p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
      
      {/* Top Banner Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{t.summary.title}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{t.summary.routeSummary}</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20">
          {vehicleType}
        </span>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-3 text-sm">
        
        {/* Distance & Est Duration */}
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">{t.summary.distance}:</span>
          <span className="font-semibold text-white">
            {breakdown.isHourly ? (
              `${breakdown.hourlyHours}h`
            ) : breakdown.distanceKm > 0 ? (
              `${breakdown.distanceKm} km (~ ${breakdown.estimatedMinutes} ${t.form.estimatedDuration})`
            ) : (
              t.form.enterAddressPrompt
            )}
          </span>
        </div>

        {/* Base Service Fee */}
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">{t.summary.basePrice}:</span>
          <span className="font-semibold text-white">
            {breakdown.basePrice > 0 ? PriceCalculator.formatCurrency(breakdown.basePrice) : '0 VNĐ'}
          </span>
        </div>

        {/* Night Surcharge (if active) */}
        {breakdown.nightPercent > 0 && (
          <div className="flex items-center justify-between text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Moon className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{t.summary.nightSurcharge} ({breakdown.nightPercent}%):</span>
            </span>
            <span className="font-bold text-amber-400">
              +{PriceCalculator.formatCurrency(breakdown.nightSurcharge)}
            </span>
          </div>
        )}

        {/* VAT 8% (if enabled) */}
        {needVat && (
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">{t.summary.vatFee}:</span>
            <span className="font-semibold text-amber-300">
              +{PriceCalculator.formatCurrency(breakdown.vatAmount)}
            </span>
          </div>
        )}

        {/* Total Price Banner */}
        <div className="pt-3 border-t border-slate-800">
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-400">{t.summary.totalEst}</p>
              <p className="text-[11px] text-slate-400">{t.summary.noVatNote}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {PriceCalculator.formatCurrency(breakdown.totalPrice)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Wait Time & Extra Stops Disclaimer Notice */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-300">{t.summary.waitingFeeNoteTitle}</span>
            <p className="mt-0.5 text-slate-400">
              {t.summary.waitingFeeNoteBody}
            </p>
            <p className="mt-1 font-semibold text-amber-400">
              📞 {t.summary.contactHotlineText} <a href="tel:0971999734" className="underline hover:text-amber-300">0971.999.734</a> {t.summary.contactHotlineSub}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-2.5 pt-2">
        
        {/* Button 1: XÁC NHẬN ĐẶT XE NGAY (Primary) */}
        <button
          type="button"
          onClick={onConfirmBooking}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 text-base border border-amber-300/50 cursor-pointer disabled:opacity-50"
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

        {/* Secondary Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          {/* Button 2: GỌI TƯ VẤN TRỰC TIẾP */}
          <a
            href="tel:0971999734"
            className="w-full py-3 px-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all border border-slate-700 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{t.common.callHotline}</span>
          </a>

          {/* Button 3: LIÊN HỆ QUA ZALO */}
          <a
            href="https://zalo.me/0971999734"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all border border-blue-500/40 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-blue-600/20"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>{t.common.chatZalo} 0971.999.734</span>
          </a>

        </div>

      </div>

    </div>
  );
};


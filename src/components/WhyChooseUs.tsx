import React from 'react';
import { UserCheck, Clock, ShieldCheck, Headphones, Award } from 'lucide-react';
import dgoLogoImg from '../assets/images/dgo_app_logo_1785380889422.jpg';
import { useLanguage } from '../i18n/LanguageContext';

export const WhyChooseUs: React.FC = () => {
  const { t } = useLanguage();

  const advantages = [
    {
      icon: UserCheck,
      title: t.whyUs.reason1Title,
      desc: t.whyUs.reason1Desc
    },
    {
      icon: Clock,
      title: t.whyUs.reason2Title,
      desc: t.whyUs.reason2Desc
    },
    {
      icon: ShieldCheck,
      title: t.whyUs.reason3Title,
      desc: t.whyUs.reason3Desc
    },
    {
      icon: Headphones,
      title: t.whyUs.reason4Title,
      desc: t.whyUs.reason4Desc
    }
  ];

  return (
    <div className="bg-slate-50 border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src={dgoLogoImg}
              alt="DGO Official Badge"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full shadow-lg border-2 border-amber-400 ring-4 ring-amber-400/20"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>THƯƠNG HIỆU D.GO - GOILAI247.COM</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.whyUs.heading}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {t.whyUs.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all hover:-translate-y-1 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};


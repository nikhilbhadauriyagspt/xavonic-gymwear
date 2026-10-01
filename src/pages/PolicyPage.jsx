import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText, RotateCcw, Truck, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { useBrand } from '../context/BrandContext';

export default function PolicyPage({ policyType }) {
  const location = useLocation();
  const { brand: content, loading } = useBrand();

  // Determine active tab if not passed via props
  const currentPath = location.pathname.replace('/', '') || policyType || 'privacy';

  const tabs = [
    { key: 'privacy', label: 'Privacy Policy', path: '/privacy', icon: Shield },
    { key: 'terms', label: 'Terms of Service', path: '/terms', icon: FileText },
    { key: 'returns', label: 'Returns & Exchanges', path: '/returns', icon: RotateCcw },
    { key: 'shipping', label: 'Shipping Policy', path: '/shipping', icon: Truck },
  ];

  let currentTitle = 'Policy Details';
  let currentHtml = '<p>Content is loading...</p>';

  if (content) {
    if (currentPath === 'privacy') {
      currentTitle = 'Privacy Policy';
      currentHtml = content.privacy_policy_html || content.policy_privacy_policy_html || '<h2>Privacy Policy</h2><p>Our privacy policy ensures your personal and payment details are safe and never shared.</p>';
    } else if (currentPath === 'terms') {
      currentTitle = 'Terms of Service';
      currentHtml = content.terms_of_service_html || content.policy_terms_of_service_html || '<h2>Terms of Service</h2><p>By using our service you agree to our terms and conditions.</p>';
    } else if (currentPath === 'returns') {
      currentTitle = '7-Day Return & Exchange Policy';
      currentHtml = content.returns_refunds_html || content.policy_returns_refunds_html || '<h2>Returns & Exchanges</h2><p>Hassle-free 7-day doorstep replacement and exchange available.</p>';
    } else if (currentPath === 'shipping') {
      currentTitle = 'Shipping & Delivery Policy';
      currentHtml = content.shipping_policy_html || content.policy_shipping_policy_html || '<h2>Shipping Information</h2><p>Orders dispatched within 24 hours. Express 2-4 days transit across India.</p>';
    }
  }

  return (
    <div className="w-full min-h-screen bg-black text-zinc-100 font-sans selection:bg-red-600 selection:text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-14">
      {/* Breadcrumb Header */}
      <div className="max-w-6xl mx-auto space-y-4 mb-10">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Link to="/" className="hover:text-red-500 transition-colors">HOME</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-500 uppercase">LEGAL & POLICIES</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-red-500 uppercase font-semibold">{currentTitle}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-500 block mb-1">
              Official Store Policy
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
              {currentTitle}
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Last Updated: <span className="text-zinc-200">October 2026</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-950 border border-zinc-900 p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 py-1.5 block">
              Policy Index
            </span>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPath === tab.key;
              return (
                <Link
                  key={tab.key}
                  to={tab.path}
                  className={`flex items-center gap-3 px-3.5 py-3 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Contact Box */}
          {content && (
            <div className="bg-zinc-950 border border-zinc-900 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Need Immediate Help?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reach out to our customer care team for prompt resolution.
              </p>
              <div className="space-y-2 pt-2 border-t border-zinc-900 text-xs">
                {content.support_email && (
                  <a
                    href={`mailto:${content.support_email}`}
                    className="flex items-center gap-2 text-zinc-300 hover:text-red-400 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{content.support_email}</span>
                  </a>
                )}
                {content.support_phone && (
                  <a
                    href={`tel:${content.support_phone}`}
                    className="flex items-center gap-2 text-zinc-300 hover:text-red-400 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{content.support_phone}</span>
                  </a>
                )}
                {content.office_address && (
                  <div className="flex items-start gap-2 text-[11px] text-zinc-400 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{content.office_address}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Policy Content Body */}
        <div className="lg:col-span-9 bg-zinc-950 border border-zinc-900 p-6 sm:p-10 shadow-2xl">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
              <div className="h-4 bg-zinc-800/60 rounded w-full"></div>
              <div className="h-4 bg-zinc-800/60 rounded w-5/6"></div>
              <div className="h-4 bg-zinc-800/60 rounded w-4/6"></div>
            </div>
          ) : (
            <article
              className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed
                prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-3 prose-h2:mt-2
                prose-h3:text-base sm:prose-h3:text-lg prose-h3:text-red-400 prose-h3:mt-6
                prose-p:text-zinc-400 prose-p:my-3
                prose-ul:text-zinc-400 prose-ul:my-3 prose-li:my-1
                prose-strong:text-zinc-100"
              dangerouslySetInnerHTML={{ __html: currentHtml }}
            />
          )}
        </div>

      </div>
    </div>
  );
}

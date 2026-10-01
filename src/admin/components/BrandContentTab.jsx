import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Share2,
  FileText,
  HelpCircle,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Shield,
  ExternalLink,
  Code,
  Eye,
  Type,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_API_BASE } from '../../config/api';

// Simple Visual WYSIWYG / HTML Toolbar component for Policy and About Text
function RichTextEditor({ value, onChange, placeholder = 'Write rich content here...' }) {
  const [activeMode, setActiveMode] = useState('visual'); // 'visual' | 'code'

  const insertTag = (openTag, closeTag = '') => {
    const textarea = document.getElementById('rich-textarea-editor');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = `${openTag}${selected || 'Sample text'}${closeTag}`;
    const nextVal = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextVal);
  };

  return (
    <div className="border border-neutral-300 rounded-sm bg-white overflow-hidden space-y-0">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-neutral-100 border-b border-neutral-200 text-neutral-700">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertTag('<h2>', '</h2>')}
            className="p-1.5 hover:bg-neutral-200 rounded-xs text-xs font-bold transition-colors"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertTag('<h3>', '</h3>')}
            className="p-1.5 hover:bg-neutral-200 rounded-xs text-xs font-bold transition-colors"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertTag('<strong>', '</strong>')}
            className="p-1.5 hover:bg-neutral-200 rounded-xs transition-colors"
            title="Bold Text"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<em>', '</em>')}
            className="p-1.5 hover:bg-neutral-200 rounded-xs transition-colors"
            title="Italic Text"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
            className="p-1.5 hover:bg-neutral-200 rounded-xs transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<p>', '</p>')}
            className="p-1.5 hover:bg-neutral-200 rounded-xs text-xs font-mono transition-colors"
            title="Paragraph"
          >
            &lt;p&gt;
          </button>
          <button
            type="button"
            onClick={() => insertTag('<div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs my-3">', '</div>')}
            className="p-1.5 hover:bg-neutral-200 rounded-xs text-xs font-medium transition-colors"
            title="Highlight Box"
          >
            Box
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveMode('visual')}
            className={`px-2.5 py-1 text-[11px] font-semibold uppercase rounded-xs transition-colors ${
              activeMode === 'visual'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            Live Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('code')}
            className={`px-2.5 py-1 text-[11px] font-semibold uppercase rounded-xs transition-colors ${
              activeMode === 'code'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            Edit HTML
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeMode === 'code' ? (
        <textarea
          id="rich-textarea-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="w-full p-3 text-xs font-mono text-neutral-900 bg-neutral-900 text-neutral-100 outline-none resize-y selection:bg-red-600"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
          <textarea
            id="rich-textarea-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={12}
            className="w-full p-3 text-xs text-neutral-900 outline-none resize-y font-sans"
          />
          <div className="p-4 bg-neutral-50 overflow-y-auto max-h-[300px] text-xs text-neutral-800 prose prose-sm leading-relaxed">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Live Rendered Output
            </span>
            <div dangerouslySetInnerHTML={{ __html: value || '<p className="text-neutral-400 italic">Preview will appear here...</p>' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrandContentTab() {
  const [activeSubTab, setActiveSubTab] = useState('brand'); // 'brand' | 'social' | 'about' | 'policies'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selected Policy to edit in Tab 4
  const [selectedPolicyKey, setSelectedPolicyKey] = useState('privacy_policy_html');

  // Form State
  const [data, setData] = useState({
    logo_white: '',
    logo_black: '',
    brand_name: 'Xavonic Aesthetics',
    brand_tagline: 'Engineered for Aesthetics & Relentless Performance',

    instagram_url: 'https://instagram.com',
    facebook_url: 'https://facebook.com',
    youtube_url: 'https://youtube.com',
    twitter_url: 'https://twitter.com',
    whatsapp_number: '919876543210',
    support_email: 'support@xavonic.com',
    support_phone: '+91 98765 43210',
    office_address: 'Xavonic Performance Apparel Pvt Ltd, DLF Cyber City, Sector 24, Gurugram, Haryana - 122002',
    copyright_text: `© ${new Date().getFullYear()} Xavonic Aesthetics Inc. All rights reserved. Designed for active lifestyles.`,

    about_heading: 'Gym Wear for Men & Women',
    about_badge: 'Brand Story & Training Guide',
    about_tagline: 'Engineered for Performance. Cut for Aesthetics.',
    about_story_html: '',
    about_faqs: [],
    popular_searches: [],

    privacy_policy_html: '',
    terms_of_service_html: '',
    returns_refunds_html: '',
    shipping_policy_html: '',
  });

  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const [newSearchTag, setNewSearchTag] = useState('');

  // Fetch Data
  const loadBrandContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_BASE}/settings/brand-content`);
      const resData = await res.json();
      if (resData.success && resData.content) {
        setData((prev) => ({ ...prev, ...resData.content }));
      }
    } catch (err) {
      console.warn('Failed to load brand content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrandContent();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('xavonic_admin_token');
      const res = await fetch(`${ADMIN_API_BASE}/settings/brand-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success('Brand identity, About Story & Policy pages saved to database!');
      } else {
        toast.error(resData.message || 'Failed to save');
      }
    } catch (err) {
      toast.error('Could not connect to backend server');
    } finally {
      setSaving(false);
    }
  };

  const addFaq = () => {
    if (!newFaq.q.trim() || !newFaq.a.trim()) {
      toast.error('Question and Answer are required');
      return;
    }
    setData((prev) => ({
      ...prev,
      about_faqs: [...(prev.about_faqs || []), { ...newFaq }],
    }));
    setNewFaq({ q: '', a: '' });
    toast.success('FAQ item added');
  };

  const removeFaq = (idx) => {
    setData((prev) => ({
      ...prev,
      about_faqs: (prev.about_faqs || []).filter((_, i) => i !== idx),
    }));
  };

  const addSearchTag = () => {
    if (!newSearchTag.trim()) return;
    setData((prev) => ({
      ...prev,
      popular_searches: [...(prev.popular_searches || []), newSearchTag.trim()],
    }));
    setNewSearchTag('');
  };

  const removeSearchTag = (idx) => {
    setData((prev) => ({
      ...prev,
      popular_searches: (prev.popular_searches || []).filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-neutral-400 bg-white border border-neutral-200 rounded-sm">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-neutral-900 mb-2" />
        <span className="text-xs">Loading Brand Identity & CMS Pages...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 font-sans pb-16">
      {/* 1. Header with Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-neutral-200 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              Brand Identity, About Us & Content CMS
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-xs">
              Live Engine
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Centrally customize Brand Logos, Social Handles, About Us Story, FAQs, and Rich Legal Policy Pages.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* 2. Top Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-3 pt-2 rounded-sm">
        <button
          type="button"
          onClick={() => setActiveSubTab('brand')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'brand'
              ? 'border-neutral-900 text-neutral-950 bg-neutral-50'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Brand & Logos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('social')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'social'
              ? 'border-neutral-900 text-neutral-950 bg-neutral-50'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Share2 className="w-4 h-4 text-pink-600" />
          <span>Social & Contact</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'about'
              ? 'border-neutral-900 text-neutral-950 bg-neutral-50'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>About Story & FAQs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'policies'
              ? 'border-neutral-900 text-neutral-950 bg-neutral-50'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Policy Pages (Editor)</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ======================================================== */}
        {/* SUB-TAB 1: BRAND LOGOS & IDENTITY                        */}
        {/* ======================================================== */}
        {activeSubTab === 'brand' && (
          <div className="space-y-5">
            <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <ImageIcon className="w-4 h-4 text-neutral-900" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Brand Name & Logos (Light & Dark Themes)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700">Brand Name</label>
                  <input
                    type="text"
                    value={data.brand_name}
                    onChange={(e) => setData({ ...data, brand_name: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700">Brand Tagline</label>
                  <input
                    type="text"
                    value={data.brand_tagline}
                    onChange={(e) => setData({ ...data, brand_tagline: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>

              {/* Logo Uploads / URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                
                {/* White Logo (For Dark Header) */}
                <div className="p-4 border border-neutral-200 rounded-xs bg-neutral-950 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      1. White Logo (For Dark Header / Black Background)
                    </span>
                  </div>
                  
                  <div className="h-20 bg-neutral-900 border border-neutral-800 rounded-xs flex items-center justify-center p-3">
                    {data.logo_white ? (
                      <img src={data.logo_white} alt="White Logo" className="max-h-12 w-auto object-contain" />
                    ) : (
                      <span className="text-xs text-neutral-500 italic">Default white logo in use</span>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Paste Cloudinary / Image URL for White Logo"
                    value={data.logo_white}
                    onChange={(e) => setData({ ...data, logo_white: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xs px-3 py-1.5 text-xs outline-none font-mono"
                  />
                </div>

                {/* Black Logo (For Light Scrolled Header & Invoices) */}
                <div className="p-4 border border-neutral-200 rounded-xs bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                      2. Black Logo (For Light Header, Invoices & Mobile Drawer)
                    </span>
                  </div>

                  <div className="h-20 bg-white border border-neutral-200 rounded-xs flex items-center justify-center p-3">
                    {data.logo_black ? (
                      <img src={data.logo_black} alt="Black Logo" className="max-h-12 w-auto object-contain" />
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Default black logo in use</span>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Paste Cloudinary / Image URL for Black Logo"
                    value={data.logo_black}
                    onChange={(e) => setData({ ...data, logo_black: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
                  />
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUB-TAB 2: SOCIAL MEDIA & CONTACT INFORMATION            */}
        {/* ======================================================== */}
        {activeSubTab === 'social' && (
          <div className="space-y-5">
            <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <Share2 className="w-4 h-4 text-pink-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Social Media Links (Rendered in Footer & Share Modals)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-pink-600 font-bold text-[10px]">IG</span>
                    <span>Instagram Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={data.instagram_url}
                    onChange={(e) => setData({ ...data, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/yourbrand"
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-blue-600 font-bold text-[10px]">FB</span>
                    <span>Facebook Page URL</span>
                  </label>
                  <input
                    type="url"
                    value={data.facebook_url}
                    onChange={(e) => setData({ ...data, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/yourbrand"
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-red-600 font-bold text-[10px]">YT</span>
                    <span>YouTube Channel URL</span>
                  </label>
                  <input
                    type="url"
                    value={data.youtube_url}
                    onChange={(e) => setData({ ...data, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/@yourbrand"
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-neutral-800 font-bold text-[10px]">X</span>
                    <span>Twitter / X Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={data.twitter_url}
                    onChange={(e) => setData({ ...data, twitter_url: e.target.value })}
                    placeholder="https://x.com/yourbrand"
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Official Support Contacts */}
            <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <Phone className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Customer Support Contacts & Registered Office
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Support Number</span>
                  </label>
                  <input
                    type="text"
                    value={data.whatsapp_number}
                    onChange={(e) => setData({ ...data, whatsapp_number: e.target.value })}
                    placeholder="919876543210"
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Support Email</span>
                  </label>
                  <input
                    type="email"
                    value={data.support_email}
                    onChange={(e) => setData({ ...data, support_email: e.target.value })}
                    placeholder="support@xavonic.com"
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Support Phone Line</span>
                  </label>
                  <input
                    type="text"
                    value={data.support_phone}
                    onChange={(e) => setData({ ...data, support_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Registered Business Address</span>
                  </label>
                  <input
                    type="text"
                    value={data.office_address}
                    onChange={(e) => setData({ ...data, office_address: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700">Footer Copyright Statement</label>
                  <input
                    type="text"
                    value={data.copyright_text}
                    onChange={(e) => setData({ ...data, copyright_text: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs px-3 py-2 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUB-TAB 3: ABOUT US STORY & ACCORDION FAQS               */}
        {/* ======================================================== */}
        {activeSubTab === 'about' && (
          <div className="space-y-5">
            <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  Homepage About Us Story & Training Guide
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700">Section Badge</label>
                  <input
                    type="text"
                    value={data.about_badge}
                    onChange={(e) => setData({ ...data, about_badge: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs px-3 py-1.5 text-xs text-neutral-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700">Main Section Heading</label>
                  <input
                    type="text"
                    value={data.about_heading}
                    onChange={(e) => setData({ ...data, about_heading: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs px-3 py-1.5 text-xs text-neutral-900 outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-700">Sub-Tagline</label>
                  <input
                    type="text"
                    value={data.about_tagline}
                    onChange={(e) => setData({ ...data, about_tagline: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xs px-3 py-1.5 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>

              {/* Rich Text Editor for About Story */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                  Full Brand Story Content (Visual Rich Text Editor)
                </label>
                <RichTextEditor
                  value={data.about_story_html || ''}
                  onChange={(val) => setData({ ...data, about_story_html: val })}
                  placeholder="Write the full brand origin and engineering standard..."
                />
              </div>
            </div>

            {/* Accordion FAQ Manager */}
            <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-neutral-800" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    Frequently Asked Questions (Accordion List)
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {(data.about_faqs || []).length} FAQs active
                </span>
              </div>

              {/* FAQs List */}
              <div className="space-y-2.5">
                {(data.about_faqs || []).map((faq, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-neutral-900">Q: {faq.q}</p>
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="text-neutral-400 hover:text-red-600 p-0.5 transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">A: {faq.a}</p>
                  </div>
                ))}
              </div>

              {/* Add FAQ Form */}
              <div className="p-3.5 bg-neutral-50 border border-dashed border-neutral-300 rounded-xs space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 block">
                  + Add New FAQ Item
                </span>
                <input
                  type="text"
                  placeholder="Question (e.g. Does Xavonic make gym wear for both men and women?)"
                  value={newFaq.q}
                  onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                  className="w-full bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 outline-none rounded-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Answer explanation..."
                  value={newFaq.a}
                  onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                  className="w-full bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 outline-none rounded-xs"
                />
                <button
                  type="button"
                  onClick={addFaq}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
                >
                  Add FAQ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUB-TAB 4: POLICY PAGES & LEGAL CMS EDITOR               */}
        {/* ======================================================== */}
        {activeSubTab === 'policies' && (
          <div className="bg-white p-5 border border-neutral-200 rounded-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    Policy Pages & Legal CMS
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Select a policy page below to update its full content with visual formatting
                  </p>
                </div>
              </div>

              {/* Policy Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-700">Select Page:</span>
                <select
                  value={selectedPolicyKey}
                  onChange={(e) => setSelectedPolicyKey(e.target.value)}
                  className="border border-neutral-300 rounded-xs px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-50 outline-none cursor-pointer"
                >
                  <option value="privacy_policy_html">Privacy Policy (/privacy)</option>
                  <option value="terms_of_service_html">Terms of Service (/terms)</option>
                  <option value="returns_refunds_html">Returns & Exchange Policy (/returns)</option>
                  <option value="shipping_policy_html">Shipping & Delivery Policy (/shipping)</option>
                </select>
              </div>
            </div>

            {/* Rich Editor for Selected Policy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Editing: {selectedPolicyKey.replace(/_html$/, '').replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className="text-[10px] text-neutral-400">
                  Use toolbar buttons to format headings, bullet points and emphasis
                </span>
              </div>

              <RichTextEditor
                value={data[selectedPolicyKey] || ''}
                onChange={(val) => setData({ ...data, [selectedPolicyKey]: val })}
                placeholder="Write policy clauses, terms, conditions and refund timelines..."
              />
            </div>
          </div>
        )}

      </form>
    </div>
  );
}

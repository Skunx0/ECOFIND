import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import EcoReport from './EcoReport';
import AdminDashboard from './AdminDashboard';

import {
  Recycle, Search, MapPin, Plus, CheckCircle2,
  Clock3, ShieldCheck, X, Navigation, Leaf,
  ChevronRight, RefreshCw, AlertTriangle, Menu
} from 'lucide-react';

import {
  MapContainer, TileLayer, Marker, Popup, useMap
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './app.css';

const materials = [
  'All materials', 'Plastic', 'Paper', 'Glass', 'Metal',
  'Electronics', 'Batteries', 'Textiles', 'Organic'
];

const materialArabic = {
  'All materials': 'كل المواد',
  Plastic: 'البلاستيك',
  Paper: 'الورق',
  Glass: 'الزجاج',
  Metal: 'المعادن',
  Electronics: 'الإلكترونيات',
  Batteries: 'البطاريات',
  Textiles: 'المنسوجات',
  Organic: 'المواد العضوية'
};

const allWilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi',
  'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida',
  'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen',
  'Tiaret', 'Tizi Ouzou', 'Algiers', 'Djelfa',
  'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M’Sila',
  'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
  'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila',
  'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun',
  'Bordj Badji Mokhtar', 'Ouled Djellal',
  'Béni Abbès', 'In Salah', 'In Guezzam',
  'Touggourt', 'Djanet', 'El M’Ghair',
  'El Meniaa', 'Aflou', 'Barika', 'El Kantara',
  'Bir El Ater', 'El Aricha', 'Ksar Chellala',
  'Aïn Ouessara', 'Messaad', 'Ksar El Boukhari',
  'Bou Saâda', 'El Abiodh Sidi Cheikh'
];

const wilayaArabic = {
  Adrar: 'أدرار',
  Chlef: 'الشلف',
  Laghouat: 'الأغواط',
  'Oum El Bouaghi': 'أم البواقي',
  Batna: 'باتنة',
  Béjaïa: 'بجاية',
  Biskra: 'بسكرة',
  Béchar: 'بشار',
  Blida: 'البليدة',
  Bouira: 'البويرة',
  Tamanrasset: 'تمنراست',
  Tébessa: 'تبسة',
  Tlemcen: 'تلمسان',
  Tiaret: 'تيارت',
  'Tizi Ouzou': 'تيزي وزو',
  Algiers: 'الجزائر',
  Djelfa: 'الجلفة',
  Jijel: 'جيجل',
  Sétif: 'سطيف',
  Saïda: 'سعيدة',
  Skikda: 'سكيكدة',
  'Sidi Bel Abbès': 'سيدي بلعباس',
  Annaba: 'عنابة',
  Guelma: 'قالمة',
  Constantine: 'قسنطينة',
  Médéa: 'المدية',
  Mostaganem: 'مستغانم',
  'M’Sila': 'المسيلة',
  Mascara: 'معسكر',
  Ouargla: 'ورقلة',
  Oran: 'وهران',
  'El Bayadh': 'البيض',
  Illizi: 'إليزي',
  'Bordj Bou Arréridj': 'برج بوعريريج',
  Boumerdès: 'بومرداس',
  'El Tarf': 'الطارف',
  Tindouf: 'تندوف',
  Tissemsilt: 'تيسمسيلت',
  'El Oued': 'الوادي',
  Khenchela: 'خنشلة',
  'Souk Ahras': 'سوق أهراس',
  Tipaza: 'تيبازة',
  Mila: 'ميلة',
  'Aïn Defla': 'عين الدفلى',
  Naâma: 'النعامة',
  'Aïn Témouchent': 'عين تموشنت',
  Ghardaïa: 'غرداية',
  Relizane: 'غليزان',
  Timimoun: 'تيميمون',
  'Bordj Badji Mokhtar': 'برج باجي مختار',
  'Ouled Djellal': 'أولاد جلال',
  'Béni Abbès': 'بني عباس',
  'In Salah': 'عين صالح',
  'In Guezzam': 'عين قزام',
  Touggourt: 'تقرت',
  Djanet: 'جانت',
  'El M’Ghair': 'المغير',
  'El Meniaa': 'المنيعة',
  Aflou: 'أفلو',
  Barika: 'بريكة',
  'El Kantara': 'القنطرة',
  'Bir El Ater': 'بئر العاتر',
  'El Aricha': 'العريشة',
  'Ksar Chellala': 'قصر الشلالة',
  'Aïn Ouessara': 'عين وسارة',
  Messaad: 'مسعد',
  'Ksar El Boukhari': 'قصر البخاري',
  'Bou Saâda': 'بوسعادة',
  'El Abiodh Sidi Cheikh': 'الأبيض سيدي الشيخ'
};

const translations = {
  en: {
    find: 'Find a location',
    how: 'How it works',
    verification: 'Verification',
    report: 'Report an issue',
    admin: 'Admin',
    menu: 'Open menu',
    closeMenu: 'Close menu',
    submit: 'Submit a location',
    tagline: 'WASTE INTELLIGENCE FOR ALGERIA',
    hero1: 'Give your waste',
    hero2: 'a better destination.',
    heroText: 'Find collection points and recycling options for the materials you want to dispose of responsibly.',
    discover: 'DISCOVER DISPOSAL OPTIONS',
    searchTitle: 'What do you need to recycle?',
    search: 'Search materials or places',
    searchPlaceholder: 'Plastic bottles, batteries...',
    material: 'Material',
    wilaya: 'Wilaya',
    live: 'Live Supabase results',
    clear: 'Clear filters',
    directory: 'ECOFIND DIRECTORY',
    locations: 'Disposal locations',
    refresh: 'Refresh',
    loading: 'Loading recycling locations...',
    matching: 'matching locations',
    collection: 'Collection point',
    select: 'Select to locate on map',
    noResults: 'No verified locations found. Try another filter.',
    suggest: 'Suggest a recycling location',
    trust: 'Trust matters.',
    trustText: 'Community submissions remain unverified until a moderator reviews them.',
    simple: 'SIMPLE BY DESIGN',
    howTitle: 'From waste to the right place.',
    step1: '01 · Choose a material',
    step1Text: 'Tell ECOFIND what you need to dispose of.',
    step2: '02 · Find a location',
    step2Text: 'Compare suitable places on the map and list.',
    step3: '03 · Check before you go',
    step3Text: 'Review accepted materials and verification status.',
    community: 'Community reported',
    verified: 'Verified',
    contribution: 'COMMUNITY CONTRIBUTION',
    suggestTitle: 'Suggest a location',
    facility: 'Facility or collection point name',
    address: 'Address or municipality',
    accepted: 'Main material accepted',
    additional: 'Additional information',
    notice: 'Your suggestion remains unverified until a moderator checks it.',
    submitting: 'Submitting...',
    submitReview: 'Submit for review',
    thankYou: 'Thank you!',
    result: 'Submission result',
    close: 'Close',
    submitted: 'Your suggestion was submitted for review!',
    footer: 'Live database · Algeria',
    allMaterials: 'All materials',
    allWilayas: 'All wilayas',
    mapNote: 'Verified locations'
  },

  ar: {
    find: 'ابحث عن موقع',
    how: 'كيف يعمل',
    verification: 'التحقق',
    report: 'الإبلاغ عن مشكلة',
    admin: 'لوحة الإدارة',
    menu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    submit: 'أضف موقعًا',
    tagline: 'حلول ذكية للنفايات في الجزائر',
    hero1: 'امنح نفاياتك',
    hero2: 'وجهة أفضل.',
    heroText: 'اعثر على نقاط الجمع وخيارات إعادة التدوير للمواد التي تريد التخلص منها بطريقة مسؤولة.',
    discover: 'اكتشف خيارات التخلص من النفايات',
    searchTitle: 'ما المادة التي تريد إعادة تدويرها؟',
    search: 'ابحث عن المواد أو الأماكن',
    searchPlaceholder: 'قوارير بلاستيكية، بطاريات...',
    material: 'المادة',
    wilaya: 'الولاية',
    live: 'نتائج مباشرة من قاعدة البيانات',
    clear: 'مسح الفلاتر',
    directory: 'دليل ECOFIND',
    locations: 'مواقع التخلص من النفايات',
    refresh: 'تحديث',
    loading: 'جارٍ تحميل مواقع إعادة التدوير...',
    matching: 'مواقع مطابقة',
    collection: 'نقطة جمع',
    select: 'اختر لتحديد الموقع على الخريطة',
    noResults: 'لم يتم العثور على مواقع موثقة. جرّب فلترًا آخر.',
    suggest: 'اقترح موقعًا لإعادة التدوير',
    trust: 'الثقة مهمة.',
    trustText: 'تبقى اقتراحات المستخدمين غير موثقة حتى يراجعها أحد المشرفين.',
    simple: 'بسيط وسهل الاستخدام',
    howTitle: 'من النفايات إلى المكان المناسب.',
    step1: '01 · اختر المادة',
    step1Text: 'أخبر ECOFIND بما تريد التخلص منه.',
    step2: '02 · اعثر على موقع',
    step2Text: 'قارن بين المواقع المناسبة على الخريطة وفي القائمة.',
    step3: '03 · تحقق قبل الذهاب',
    step3Text: 'راجع المواد المقبولة وحالة التحقق.',
    community: 'مقترح من المجتمع',
    verified: 'موثّق',
    contribution: 'مساهمة المجتمع',
    suggestTitle: 'اقترح موقعًا',
    facility: 'اسم المنشأة أو نقطة الجمع',
    address: 'العنوان أو البلدية',
    accepted: 'المادة الرئيسية المقبولة',
    additional: 'معلومات إضافية',
    notice: 'سيبقى اقتراحك غير موثق حتى يراجعه أحد المشرفين.',
    submitting: 'جارٍ الإرسال...',
    submitReview: 'إرسال للمراجعة',
    thankYou: 'شكرًا لك!',
    result: 'نتيجة الإرسال',
    close: 'إغلاق',
    submitted: 'تم إرسال اقتراحك للمراجعة!',
    footer: 'قاعدة بيانات مباشرة · الجزائر',
    allMaterials: 'كل المواد',
    allWilayas: 'كل الولايات',
    mapNote: 'مواقع موثقة'
  }
};

const marker = L.divIcon({
  className: 'eco-marker',
  html: '<span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

function Status({ verified, t }) {
  return (
    <span className={`status ${verified ? 'verified' : 'community'}`}>
      {verified ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {verified ? t.verified : t.community}
    </span>
  );
}

function MapFocus({ point }) {
  const map = useMap();

  useEffect(() => {
    if (point?.lat != null && point?.long != null) {
      map.flyTo([Number(point.lat), Number(point.long)], 14);
    }
  }, [point, map]);

  return null;
}

export default function App() {
  const [language, setLanguage] = useState('en');
  const [currentPage, setCurrentPage] = useState('ecofind');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[language];
  const isArabic = language === 'ar';

  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [mat, setMat] = useState('All materials');
  const [wilaya, setWilaya] = useState('All wilayas');
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    address: '',
    material: 'Plastic',
    notes: ''
  });

  const wilayas = ['All wilayas', ...allWilayas];

  async function loadPoints() {
    setLoading(true);
    setError('');

    if (!supabase) {
      setError('Database connection unavailable. Check your Supabase environment variables.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('recycling_points')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setPoints(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPoints();
  }, []);

  const results = useMemo(() => {
    return points.filter(p => {
      const accepted = p.accepted_materials || [];

      const matchesMaterial =
        mat === 'All materials' || accepted.includes(mat);

      const matchesWilaya =
        wilaya === 'All wilayas' || p.wilaya === wilaya;

      const matchesSearch =
        `${p.name} ${p.address} ${accepted.join(' ')}`
          .toLowerCase()
          .includes(q.toLowerCase());

      return matchesMaterial && matchesWilaya && matchesSearch;
    });
  }, [points, q, mat, wilaya]);

  const active =
    results.find(p => p.id === selected) || results[0];

  // ECOREPORT PAGE
  if (currentPage === 'ecoreport') {
    return (
      <EcoReport
        onBack={() => setCurrentPage('ecofind')}
        language={language}
      />
    );
  }

  // ECOGUARD ADMIN DASHBOARD
  if (currentPage === 'admin') {
    return (
      <AdminDashboard
        onBack={() => setCurrentPage('ecofind')}
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  async function submit(e) {
    e.preventDefault();

    if (!supabase) {
      setMessage('Database connection unavailable.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const { error } = await supabase
      .from('recycling_points')
      .insert([{
        name: form.name,
        address: form.address,
        accepted_materials: [form.material],
        description: form.notes,
        verified: false
      }]);

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setMessage(t.submitted);
      setForm({
        name: '',
        address: '',
        material: 'Plastic',
        notes: ''
      });
    }

    setSubmitting(false);
  }

  return (
    <div
      className="shell"
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={language}
    >
      <header>
        <a
          className="brand"
          href="#top"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="logo"><Recycle /></span>
          <span>
            <b>ECOFIND</b>
            <small>BY ECOGUARD</small>
          </span>
        </a>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? t.closeMenu : t.menu}
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileMenuOpen(open => !open)}
        >
          {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav
          id="primary-navigation"
          className={`mobile-nav ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}
        >
          <a href="#locations" onClick={() => setMobileMenuOpen(false)}>
            {t.find}
          </a>

          <a href="#how" onClick={() => setMobileMenuOpen(false)}>
            {t.how}
          </a>

          <a href="#trust" onClick={() => setMobileMenuOpen(false)}>
            {t.verification}
          </a>

          <a
            href="#report"
            onClick={e => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setCurrentPage('ecoreport');
            }}
          >
            {t.report}
          </a>

          <a
            href="#admin"
            onClick={e => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setCurrentPage('admin');
            }}
          >
            {t.admin}
          </a>
        </nav>

        <div className="header-actions">
          <button
            className="outline language-button"
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
          >
            {isArabic ? 'English' : 'العربية'}
          </button>

          <button
            className="outline"
            onClick={() => {
              setMessage('');
              setModal(true);
              setMobileMenuOpen(false);
            }}
          >
            <Plus size={16} /> {t.submit}
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">
            <Leaf size={15} /> {t.tagline}
          </div>

          <h1>
            {t.hero1}<br />
            <em>{t.hero2}</em>
          </h1>

          <p>{t.heroText}</p>
        </div>

        <div className="hero-icon">
          <Recycle size={70} />
        </div>
      </section>

      <main>
        <section className="search">
          <div className="eyebrow dark">{t.discover}</div>
          <h2>{t.searchTitle}</h2>

          <div className="fields">
            <label>
              {t.search}
              <div className="input">
                <Search size={17} />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={t.searchPlaceholder}
                />
              </div>
            </label>

            <label>
              {t.material}
              <select
                value={mat}
                onChange={e => setMat(e.target.value)}
              >
                {materials.map(x => (
                  <option key={x} value={x}>
                    {isArabic ? materialArabic[x] : x}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.wilaya}
              <select
                value={wilaya}
                onChange={e => setWilaya(e.target.value)}
              >
                {wilayas.map(x => (
                  <option key={x} value={x}>
                    {isArabic
                      ? (x === 'All wilayas'
                        ? t.allWilayas
                        : (wilayaArabic[x] || x))
                      : x}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="searchfoot">
            <span>
              <MapPin size={14} /> {t.live}
            </span>

            <button
              onClick={() => {
                setQ('');
                setMat('All materials');
                setWilaya('All wilayas');
              }}
            >
              {t.clear}
            </button>
          </div>
        </section>

        <section id="locations">
          <div className="heading">
            <div>
              <div className="eyebrow dark">{t.directory}</div>
              <h2>
                {t.locations} <small>{results.length}</small>
              </h2>
            </div>

            <button className="refresh" onClick={loadPoints}>
              <RefreshCw size={15} /> {t.refresh}
            </button>
          </div>

          {loading && <p>{t.loading}</p>}

          {error && (
            <p className="error">
              <AlertTriangle size={17} /> {error}
            </p>
          )}

          {!loading && !error && (
            <section className="layout">
              <div className="map">
                <MapContainer
                  center={[36.365, 6.6147]}
                  zoom={11}
                  className="leaflet"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapFocus point={active} />

                  {results
                    .filter(p => p.lat != null && p.long != null)
                    .map(p => (
                      <Marker
                        key={p.id}
                        position={[Number(p.lat), Number(p.long)]}
                        icon={marker}
                        eventHandlers={{
                          click: () => setSelected(p.id)
                        }}
                      >
                        <Popup>
                          <b>{p.name}</b><br />
                          {p.address}
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>

                <span className="mapnote">
                  <Navigation size={13} /> {t.mapNote}
                </span>
              </div>

              <aside className="list">
                <b>{results.length} {t.matching}</b>

                {results.length ? (
                  results.map(p => (
                    <button
                      className={`card ${active?.id === p.id ? 'selected' : ''}`}
                      key={p.id}
                      onClick={() => setSelected(p.id)}
                    >
                      <div className="cardtop">
                        <small>{t.collection}</small>
                        <Status verified={p.verified} t={t} />
                      </div>

                      <h3>{p.name}</h3>

                      <p>
                        <MapPin size={13} /> {p.address}
                      </p>

                      <div className="tags">
                        {(p.accepted_materials || []).map(m => (
                          <span key={m}>
                            {isArabic ? (materialArabic[m] || m) : m}
                          </span>
                        ))}
                      </div>

                      <div className="note">
                        {t.select} <ChevronRight size={15} />
                      </div>
                    </button>
                  ))
                ) : (
                  <p>{t.noResults}</p>
                )}

                <button
                  className="submit"
                  onClick={() => {
                    setMessage('');
                    setModal(true);
                  }}
                >
                  <Plus size={16} /> {t.suggest}
                </button>
              </aside>
            </section>
          )}
        </section>

        <section className="trust" id="trust">
          <ShieldCheck />
          <div>
            <b>{t.trust}</b>
            <p>{t.trustText}</p>
          </div>
        </section>

        <section className="how" id="how">
          <div className="eyebrow dark">{t.simple}</div>
          <h2>{t.howTitle}</h2>

          <div className="steps">
            <div>
              <b>{t.step1}</b>
              <p>{t.step1Text}</p>
            </div>

            <div>
              <b>{t.step2}</b>
              <p>{t.step2Text}</p>
            </div>

            <div>
              <b>{t.step3}</b>
              <p>{t.step3Text}</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <b>ECOFIND · ECOGUARD</b>
        <span>{t.footer}</span>
      </footer>

      {modal && (
        <div className="backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modalhead">
              <div>
                <div className="eyebrow dark">{t.contribution}</div>
                <h2>{t.suggestTitle}</h2>
              </div>

              <button onClick={() => setModal(false)}>
                <X />
              </button>
            </div>

            {message ? (
              <div className="success">
                <CheckCircle2 size={35} />

                <h3>
                  {message === t.submitted ? t.thankYou : t.result}
                </h3>

                <p>{message}</p>

                <button
                  className="primary"
                  onClick={() => {
                    if (message === t.submitted) setModal(false);
                    setMessage('');
                  }}
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label>
                  {t.facility}
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({
                      ...form,
                      name: e.target.value
                    })}
                  />
                </label>

                <label>
                  {t.address}
                  <input
                    required
                    value={form.address}
                    onChange={e => setForm({
                      ...form,
                      address: e.target.value
                    })}
                  />
                </label>

                <label>
                  {t.accepted}
                  <select
                    value={form.material}
                    onChange={e => setForm({
                      ...form,
                      material: e.target.value
                    })}
                  >
                    {materials.slice(1).map(x => (
                      <option key={x} value={x}>
                        {isArabic ? materialArabic[x] : x}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {t.additional}
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({
                      ...form,
                      notes: e.target.value
                    })}
                  />
                </label>

                <p className="notice">
                  <ShieldCheck size={16} /> {t.notice}
                </p>

                <button className="primary" disabled={submitting}>
                  {submitting ? t.submitting : t.submitReview}
                  <ChevronRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
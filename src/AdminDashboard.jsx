import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';

import {
  ShieldCheck, LogOut, RefreshCw, Search, MapPin, Clock,
  CheckCircle2, AlertTriangle, FileText, X, LayoutDashboard,
  ClipboardList, ChevronRight, Menu, CalendarDays, Eye,
  Activity, ArrowUpRight, Filter, Leaf, ExternalLink, ArrowLeft
} from 'lucide-react';

import './admindashboard.css';

const statuses = [
  'pending', 'under_review', 'verified',
  'in_progress', 'resolved', 'rejected'
];

const categories = [
  'Illegal dumping',
  'Air pollution',
  'Water pollution',
  'Overflowing bins',
  'Environmental damage',
  'Other'
];

const translations = {
  en: {
    back: 'Back to ECOFIND',
    language: 'العربية',
    loadingAccess: 'Verifying secure administrator access...',
    loginEyebrow: 'SECURE CONTROL CENTER',
    welcome: 'Welcome back.',
    loginDescription: 'Sign in to access the environmental monitoring administration panel.',
    email: 'Email address',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Signing in...',
    access: 'Access dashboard',
    protected: 'Protected by Supabase Authentication',
    workspace: 'WORKSPACE',
    overview: 'Overview',
    reports: 'Environmental reports',
    protect: 'Protecting our environment',
    protectText: 'Every verified report contributes to a cleaner and safer community.',
    authorized: 'Authorized account',
    signOut: 'Sign out',
    system: 'System active',
    intelligence: 'ENVIRONMENTAL INTELLIGENCE',
    dashboard: 'Dashboard overview',
    dashboardText: 'Monitor community reports and track environmental activity across the platform.',
    refresh: 'Refresh data',
    total: 'Total reports',
    totalCaption: 'All community submissions',
    pending: 'Pending',
    pendingReview: 'Pending review',
    pendingCaption: 'Awaiting moderator review',
    verified: 'Verified',
    verifiedCaption: 'Confirmed environmental reports',
    resolved: 'Resolved',
    resolvedCaption: 'Successfully resolved reports',
    today: 'Reports submitted today',
    underReview: 'Under review',
    inProgress: 'In progress',
    attention: 'ATTENTION REQUIRED',
    attentionTitle: 'Reports requiring attention',
    attentionText: 'Recent submissions awaiting review.',
    viewAll: 'View all',
    loadingReports: 'Loading reports...',
    caughtUp: 'All caught up',
    noPending: 'There are no reports waiting for review.',
    noLocation: 'Location not provided',
    breakdown: 'REPORT BREAKDOWN',
    statusOverview: 'Status overview',
    distribution: 'Current report distribution.',
    manage: 'Manage all reports',
    latest: 'LATEST ACTIVITY',
    recent: 'Recent submissions',
    recentText: 'The latest reports submitted by the community.',
    allReports: 'All reports',
    loadingSubmissions: 'Loading submissions...',
    noSubmissions: 'No submissions yet',
    communityReports: 'Community reports will appear here.',
    report: 'Report',
    location: 'Location',
    dateSubmitted: 'Date submitted',
    notProvided: 'Not provided',
    communityManagement: 'COMMUNITY MANAGEMENT',
    reportTitle: 'Environmental reports',
    reportDescription: 'Review submissions, verify environmental issues and update report progress.',
    refreshShort: 'Refresh',
    submissions: 'Total submissions',
    allSubmissions: 'All submissions',
    found: 'reports found',
    searchPlaceholder: 'Search reports, descriptions or locations...',
    allStatuses: 'All statuses',
    allCategories: 'All categories',
    loadingEnvironmental: 'Loading environmental reports...',
    noReports: 'No reports found',
    changeFilters: 'Try changing your filters or search terms.',
    noDescription: 'No description provided.',
    evidence: 'Evidence attached',
    noEvidence: 'No evidence photo',
    review: 'Review report',
    footer: 'ECOGUARD Administration',
    footerText: 'Environmental monitoring and community protection',
    reviewEyebrow: 'REPORT REVIEW',
    submitted: 'Submitted',
    description: 'Description',
    noAddress: 'No address provided.',
    openLocation: 'Open report location',
    photograph: 'Evidence photograph',
    notes: 'Moderator notes',
    notesDescription: 'Record findings, verification details or the reason for rejecting a submission.',
    notesPlaceholder: 'Write your moderation notes here...',
    updateStatus: 'Update report status',
    statusDescription: 'Select the appropriate status for this report.',
    saving: 'Saving changes...',
    saveNotes: 'Save moderator notes',
    updated: 'Report updated successfully.',
    dateUnavailable: 'Date unavailable',
    clearSearch: 'Clear search',
    closeReport: 'Close report',
    viewReport: 'View report',
    status: {
      pending: 'Pending',
      under_review: 'Under review',
      verified: 'Verified',
      in_progress: 'In progress',
      resolved: 'Resolved',
      rejected: 'Rejected'
    },
    category: {
      'Illegal dumping': 'Illegal dumping',
      'Air pollution': 'Air pollution',
      'Water pollution': 'Water pollution',
      'Overflowing bins': 'Overflowing bins',
      'Environmental damage': 'Environmental damage',
      Other: 'Other'
    },
    role: {
      admin: 'Administrator',
      moderator: 'Moderator'
    }
  },

  ar: {
    back: 'العودة إلى ECOFIND',
    language: 'English',
    loadingAccess: 'جارٍ التحقق من صلاحيات الدخول...',
    loginEyebrow: 'مركز التحكم الآمن',
    welcome: 'مرحبًا بعودتك.',
    loginDescription: 'سجّل الدخول للوصول إلى لوحة إدارة ومراقبة البيئة.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    signIn: 'جارٍ تسجيل الدخول...',
    access: 'الدخول إلى لوحة الإدارة',
    protected: 'محمي بواسطة نظام المصادقة Supabase',
    workspace: 'مساحة العمل',
    overview: 'نظرة عامة',
    reports: 'التقارير البيئية',
    protect: 'نحمي بيئتنا',
    protectText: 'يساهم كل تقرير موثّق في بناء مجتمع أنظف وأكثر أمانًا.',
    authorized: 'حساب مصرح له',
    signOut: 'تسجيل الخروج',
    system: 'النظام يعمل',
    intelligence: 'المعلومات البيئية',
    dashboard: 'نظرة عامة على لوحة التحكم',
    dashboardText: 'تابع تقارير المجتمع وراقب النشاط البيئي عبر المنصة.',
    refresh: 'تحديث البيانات',
    total: 'إجمالي التقارير',
    totalCaption: 'جميع مساهمات المجتمع',
    pending: 'قيد الانتظار',
    pendingReview: 'بانتظار المراجعة',
    pendingCaption: 'في انتظار مراجعة المشرف',
    verified: 'موثّق',
    verifiedCaption: 'تقارير بيئية تم التأكد منها',
    resolved: 'تم الحل',
    resolvedCaption: 'تقارير تمت معالجتها بنجاح',
    today: 'التقارير المرسلة اليوم',
    underReview: 'قيد المراجعة',
    inProgress: 'قيد المعالجة',
    attention: 'يتطلب الانتباه',
    attentionTitle: 'تقارير تتطلب المراجعة',
    attentionText: 'أحدث البلاغات التي تنتظر المراجعة.',
    viewAll: 'عرض الكل',
    loadingReports: 'جارٍ تحميل التقارير...',
    caughtUp: 'كل شيء محدّث',
    noPending: 'لا توجد تقارير تنتظر المراجعة حاليًا.',
    noLocation: 'لم يتم تحديد الموقع',
    breakdown: 'توزيع التقارير',
    statusOverview: 'نظرة عامة على الحالات',
    distribution: 'التوزيع الحالي للتقارير.',
    manage: 'إدارة جميع التقارير',
    latest: 'أحدث النشاطات',
    recent: 'أحدث البلاغات',
    recentText: 'أحدث التقارير المرسلة من المجتمع.',
    allReports: 'جميع التقارير',
    loadingSubmissions: 'جارٍ تحميل البلاغات...',
    noSubmissions: 'لا توجد بلاغات بعد',
    communityReports: 'ستظهر تقارير المجتمع هنا.',
    report: 'التقرير',
    location: 'الموقع',
    dateSubmitted: 'تاريخ الإرسال',
    notProvided: 'غير محدد',
    communityManagement: 'إدارة المجتمع',
    reportTitle: 'التقارير البيئية',
    reportDescription: 'راجع البلاغات وتحقق من المشكلات البيئية وحدّث حالة معالجتها.',
    refreshShort: 'تحديث',
    submissions: 'إجمالي البلاغات',
    allSubmissions: 'جميع البلاغات',
    found: 'تقرير تم العثور عليه',
    searchPlaceholder: 'ابحث في التقارير أو الأوصاف أو المواقع...',
    allStatuses: 'جميع الحالات',
    allCategories: 'جميع التصنيفات',
    loadingEnvironmental: 'جارٍ تحميل التقارير البيئية...',
    noReports: 'لم يتم العثور على تقارير',
    changeFilters: 'جرّب تغيير الفلاتر أو كلمات البحث.',
    noDescription: 'لا يوجد وصف.',
    evidence: 'صورة مرفقة',
    noEvidence: 'لا توجد صورة إثبات',
    review: 'مراجعة التقرير',
    footer: 'إدارة ECOGUARD',
    footerText: 'المراقبة البيئية وحماية المجتمع',
    reviewEyebrow: 'مراجعة التقرير',
    submitted: 'تاريخ الإرسال',
    description: 'الوصف',
    noAddress: 'لم يتم تقديم عنوان.',
    openLocation: 'فتح موقع التقرير',
    photograph: 'صورة الإثبات',
    notes: 'ملاحظات المشرف',
    notesDescription: 'سجّل النتائج أو تفاصيل التحقق أو سبب رفض البلاغ.',
    notesPlaceholder: 'اكتب ملاحظات المراجعة هنا...',
    updateStatus: 'تحديث حالة التقرير',
    statusDescription: 'اختر الحالة المناسبة لهذا التقرير.',
    saving: 'جارٍ حفظ التغييرات...',
    saveNotes: 'حفظ ملاحظات المشرف',
    updated: 'تم تحديث التقرير بنجاح.',
    dateUnavailable: 'التاريخ غير متاح',
    clearSearch: 'مسح البحث',
    closeReport: 'إغلاق التقرير',
    viewReport: 'عرض التقرير',
    status: {
      pending: 'قيد الانتظار',
      under_review: 'قيد المراجعة',
      verified: 'موثّق',
      in_progress: 'قيد المعالجة',
      resolved: 'تم الحل',
      rejected: 'مرفوض'
    },
    category: {
      'Illegal dumping': 'رمي النفايات عشوائيًا',
      'Air pollution': 'تلوث الهواء',
      'Water pollution': 'تلوث المياه',
      'Overflowing bins': 'حاويات نفايات فائضة',
      'Environmental damage': 'أضرار بيئية',
      Other: 'أخرى'
    },
    role: {
      admin: 'مدير النظام',
      moderator: 'مشرف'
    }
  }
};

function formatDate(date, language) {
  if (!date) return translations[language].dateUnavailable;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return translations[language].dateUnavailable;
  }

  return parsed.toLocaleDateString(
    language === 'ar' ? 'ar-DZ' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );
}

function formatDateTime(date, language) {
  if (!date) return translations[language].dateUnavailable;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return translations[language].dateUnavailable;
  }

  return parsed.toLocaleString(language === 'ar' ? 'ar-DZ' : 'en-GB');
}

export default function AdminDashboard({
  onBack,
  language = 'en',
  onLanguageChange
}) {
  const isArabic = language === 'ar';
  const t = translations[isArabic ? 'ar' : 'en'];

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);
  const [accessError, setAccessError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [notes, setNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState(false);

  const statusLabel = status => t.status[status] || status;
  const categoryLabel = category => t.category[category] || category;
  const roleLabel = role => t.role[role] || role;

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    if (!supabase) {
      setAccessError('Database connection is unavailable.');
      setChecking(false);
      return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setAccessError(error.message);
      setChecking(false);
      return;
    }

    if (data.session?.user) {
      await checkProfile(data.session.user);
    }

    setChecking(false);
  }

  async function checkProfile(authUser) {
    setUser(authUser);
    setAccessError('');

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      setAccessError(error.message);
      setProfile(null);
      return;
    }

    if (!data || !['admin', 'moderator'].includes(data.role)) {
      setAccessError(
        isArabic
          ? 'هذا الحساب لا يملك صلاحيات المشرف.'
          : 'Your account does not have moderator access.'
      );
      setProfile(null);
      return;
    }

    setProfile(data);
    await loadReports();
  }

  async function login(e) {
    e.preventDefault();

    if (!supabase) {
      setLoginError('Database connection is unavailable.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setLoginError(error.message);
    } else if (data.user) {
      await checkProfile(data.user);
      setPassword('');
    }

    setLoginLoading(false);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAccessError(error.message);
      return;
    }

    setUser(null);
    setProfile(null);
    setReports([]);
    setSelectedReport(null);
    setAccessError('');
    setActiveSection('overview');
  }

  async function loadReports() {
    if (!supabase) return;

    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('environmental_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setReports(data || []);
    }

    setLoading(false);
  }

  async function updateReport(report, newStatus) {
    setUpdatingId(report.id);
    setActionMessage('');
    setActionError(false);

    const moderatorNote =
      notes[report.id] ?? report.moderator_note ?? null;

    const { data, error } = await supabase
      .from('environmental_reports')
      .update({
        status: newStatus,
        moderator_note: moderatorNote
      })
      .eq('id', report.id)
      .select()
      .single();

    if (error) {
      setActionMessage(error.message);
      setActionError(true);
    } else {
      setReports(previous =>
        previous.map(item => item.id === report.id ? data : item)
      );

      setSelectedReport(data);
      setActionMessage(t.updated);
    }

    setUpdatingId(null);
  }

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesStatus =
        filterStatus === 'all' || report.status === filterStatus;

      const matchesCategory =
        filterCategory === 'all' || report.category === filterCategory;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        `${report.category || ''} ${report.description || ''} ${report.address || ''}`
          .toLowerCase()
          .includes(searchText);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [reports, filterStatus, filterCategory, search]);

  const count = status =>
    reports.filter(report => report.status === status).length;

  const todayReports = reports.filter(report => {
    if (!report.created_at) return false;

    return new Date(report.created_at).toDateString() ===
      new Date().toDateString();
  }).length;

  const pendingReports = reports
    .filter(report => ['pending', 'under_review'].includes(report.status))
    .slice(0, 5);

  const recentReports = reports.slice(0, 5);

  function navigate(section) {
    setActiveSection(section);
    setSidebarOpen(false);
  }

  function openReport(report) {
    setSelectedReport(report);
    setActionMessage('');
    setActionError(false);
  }

  const BackButton = () => (
    <button
      type="button"
      className="admin-back-button"
      onClick={onBack}
    >
      <ArrowLeft size={17} />
      <span>{t.back}</span>
    </button>
  );

  const LanguageButton = () => (
    onLanguageChange ? (
      <button
        type="button"
        className="admin-language-button"
        onClick={() => onLanguageChange(isArabic ? 'en' : 'ar')}
      >
        {t.language}
      </button>
    ) : null
  );

  if (checking) {
    return (
      <div className={`admin-loading ${isArabic ? 'admin-rtl' : ''}`} dir={isArabic ? 'rtl' : 'ltr'} lang={language}>
        <div className="admin-login-actions">
          <BackButton />
          <LanguageButton />
        </div>
        <RefreshCw className="admin-spin" size={28} />
        <p>{t.loadingAccess}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`admin-login-page ${isArabic ? 'admin-rtl' : ''}`} dir={isArabic ? 'rtl' : 'ltr'} lang={language}>
        <div className="admin-login-actions">
          <BackButton />
          <LanguageButton />
        </div>

        <div className="admin-login-card">
          <div className="admin-login-brand">
            <div className="admin-logo">
              <ShieldCheck size={30} />
            </div>
            <span>ECOGUARD</span>
          </div>

          <span className="admin-eyebrow">{t.loginEyebrow}</span>
          <h1>{t.welcome}</h1>
          <p>{t.loginDescription}</p>

          {accessError && (
            <div className="admin-error">
              <AlertTriangle size={17} />
              {accessError}
            </div>
          )}

          <form onSubmit={login}>
            <label>
              {t.email}
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </label>

            <label>
              {t.password}
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
              />
            </label>

            {loginError && (
              <div className="admin-error">
                <AlertTriangle size={17} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="admin-primary"
              disabled={loginLoading}
            >
              {loginLoading ? t.signIn : t.access}
              {!loginLoading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="admin-login-footer">
            <ShieldCheck size={15} />
            {t.protected}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`admin-dashboard ${isArabic ? 'admin-rtl' : ''}`}
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={language}
    >
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-logo">
            <ShieldCheck size={26} />
          </div>
          <div>
            <strong>ECOGUARD</strong>
            <span>ENVIRONMENTAL INTELLIGENCE</span>
          </div>
        </div>

        <div className="admin-sidebar-label">{t.workspace}</div>

        <nav className="admin-navigation">
          <button
            className={activeSection === 'overview' ? 'active' : ''}
            onClick={() => navigate('overview')}
          >
            <LayoutDashboard size={19} />
            <span>{t.overview}</span>
          </button>

          <button
            className={activeSection === 'reports' ? 'active' : ''}
            onClick={() => navigate('reports')}
          >
            <ClipboardList size={19} />
            <span>{t.reports}</span>
            {count('pending') > 0 && (
              <span className="admin-nav-count">{count('pending')}</span>
            )}
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-info">
            <div className="admin-sidebar-info-icon">
              <Leaf size={20} />
            </div>
            <strong>{t.protect}</strong>
            <p>{t.protectText}</p>
          </div>

          <div className="admin-sidebar-account">
            <div className="admin-avatar">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>{roleLabel(profile.role)}</strong>
              <span>{t.authorized}</span>
            </div>
            <button onClick={logout} title={t.signOut} aria-label={t.signOut}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label={isArabic ? 'فتح القائمة' : 'Open menu'}
            >
              <Menu size={21} />
            </button>

            <div className="admin-breadcrumb">
              <span>{t.workspace}</span>
              <ChevronRight size={14} />
              <strong>
                {activeSection === 'overview' ? t.overview : t.reports}
              </strong>
            </div>
          </div>

          <div className="admin-topbar-right">
            <BackButton />
            <LanguageButton />

            <div className="admin-secure-indicator">
              <span />
              {t.system}
            </div>

            <div className="admin-user-badge">
              <div className="admin-avatar">
                <ShieldCheck size={17} />
              </div>
              <span>{roleLabel(profile.role)}</span>
            </div>

            <button
              className="admin-topbar-logout"
              onClick={logout}
              title={t.signOut}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="admin-main">
          {activeSection === 'overview' && (
            <>
              <section className="admin-page-heading">
                <div>
                  <span className="admin-eyebrow">{t.intelligence}</span>
                  <h1>{t.dashboard}</h1>
                  <p>{t.dashboardText}</p>
                </div>

                <button className="admin-refresh" onClick={loadReports} disabled={loading}>
                  <RefreshCw size={17} className={loading ? 'admin-spin' : ''} />
                  {t.refresh}
                </button>
              </section>

              {error && (
                <div className="admin-error">
                  <AlertTriangle size={17} />
                  {error}
                </div>
              )}

              <section className="admin-stat-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-top">
                    <span>{t.total}</span>
                    <div className="admin-stat-icon green"><FileText size={20} /></div>
                  </div>
                  <strong>{reports.length}</strong>
                  <span className="admin-stat-caption">{t.totalCaption}</span>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-top">
                    <span>{t.pendingReview}</span>
                    <div className="admin-stat-icon amber"><Clock size={20} /></div>
                  </div>
                  <strong>{count('pending')}</strong>
                  <span className="admin-stat-caption">{t.pendingCaption}</span>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-top">
                    <span>{t.verified}</span>
                    <div className="admin-stat-icon blue"><ShieldCheck size={20} /></div>
                  </div>
                  <strong>{count('verified')}</strong>
                  <span className="admin-stat-caption">{t.verifiedCaption}</span>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-top">
                    <span>{t.resolved}</span>
                    <div className="admin-stat-icon teal"><CheckCircle2 size={20} /></div>
                  </div>
                  <strong>{count('resolved')}</strong>
                  <span className="admin-stat-caption">{t.resolvedCaption}</span>
                </div>
              </section>

              <section className="admin-secondary-stats">
                <div>
                  <div className="admin-secondary-stat-icon"><Activity size={19} /></div>
                  <div><span>{t.today}</span><strong>{todayReports}</strong></div>
                </div>
                <div>
                  <div className="admin-secondary-stat-icon"><ClipboardList size={19} /></div>
                  <div><span>{t.underReview}</span><strong>{count('under_review')}</strong></div>
                </div>
                <div>
                  <div className="admin-secondary-stat-icon"><AlertTriangle size={19} /></div>
                  <div><span>{t.inProgress}</span><strong>{count('in_progress')}</strong></div>
                </div>
              </section>

              <section className="admin-overview-grid">
                <div className="admin-panel admin-priority-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-eyebrow">{t.attention}</span>
                      <h2>{t.attentionTitle}</h2>
                      <p>{t.attentionText}</p>
                    </div>
                    <button className="admin-text-button" onClick={() => navigate('reports')}>
                      {t.viewAll} <ArrowUpRight size={16} />
                    </button>
                  </div>

                  {loading ? (
                    <div className="admin-empty">
                      <RefreshCw className="admin-spin" />
                      {t.loadingReports}
                    </div>
                  ) : pendingReports.length === 0 ? (
                    <div className="admin-empty">
                      <CheckCircle2 size={30} />
                      <h3>{t.caughtUp}</h3>
                      <p>{t.noPending}</p>
                    </div>
                  ) : (
                    <div className="admin-priority-list">
                      {pendingReports.map(report => (
                        <div className="admin-priority-item" key={report.id}>
                          <div className="admin-priority-icon"><FileText size={19} /></div>
                          <div className="admin-priority-info">
                            <strong>{categoryLabel(report.category)}</strong>
                            <span>{report.address || t.noLocation}</span>
                            <small>{formatDate(report.created_at, language)}</small>
                          </div>
                          <span className={`admin-status ${report.status}`}>
                            {statusLabel(report.status)}
                          </span>
                          <button onClick={() => openReport(report)} aria-label={t.viewReport} title={t.viewReport}>
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-panel admin-status-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-eyebrow">{t.breakdown}</span>
                      <h2>{t.statusOverview}</h2>
                      <p>{t.distribution}</p>
                    </div>
                  </div>

                  <div className="admin-status-breakdown">
                    {statuses.map(status => {
                      const percentage = reports.length
                        ? (count(status) / reports.length) * 100
                        : 0;

                      return (
                        <div className="admin-breakdown-item" key={status}>
                          <div className="admin-breakdown-heading">
                            <span>
                              <i className={`admin-dot ${status}`} />
                              {statusLabel(status)}
                            </span>
                            <strong>{count(status)}</strong>
                          </div>
                          <div className="admin-progress-track">
                            <div
                              className={`admin-progress-fill ${status}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button className="admin-full-button" onClick={() => navigate('reports')}>
                    {t.manage}
                    <ChevronRight size={17} />
                  </button>
                </div>
              </section>

              <section className="admin-panel admin-recent-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-eyebrow">{t.latest}</span>
                    <h2>{t.recent}</h2>
                    <p>{t.recentText}</p>
                  </div>
                  <button className="admin-text-button" onClick={() => navigate('reports')}>
                    {t.allReports} <ArrowUpRight size={16} />
                  </button>
                </div>

                {loading ? (
                  <div className="admin-empty">{t.loadingSubmissions}</div>
                ) : recentReports.length === 0 ? (
                  <div className="admin-empty">
                    <FileText size={30} />
                    <h3>{t.noSubmissions}</h3>
                    <p>{t.communityReports}</p>
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{t.report}</th>
                          <th>{t.location}</th>
                          <th>{t.dateSubmitted}</th>
                          <th>{t.statusOverview}</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {recentReports.map(report => (
                          <tr key={report.id}>
                            <td>
                              <strong>{categoryLabel(report.category)}</strong>
                              <small>
                                {report.description?.slice(0, 65) || t.noDescription}
                                {report.description?.length > 65 ? '...' : ''}
                              </small>
                            </td>
                            <td>
                              <span className="admin-table-location">
                                <MapPin size={14} />
                                {report.address || t.notProvided}
                              </span>
                            </td>
                            <td>{formatDate(report.created_at, language)}</td>
                            <td>
                              <span className={`admin-status ${report.status}`}>
                                {statusLabel(report.status)}
                              </span>
                            </td>
                            <td>
                              <button className="admin-view-button" onClick={() => openReport(report)}>
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {activeSection === 'reports' && (
            <>
              <section className="admin-page-heading">
                <div>
                  <span className="admin-eyebrow">{t.communityManagement}</span>
                  <h1>{t.reportTitle}</h1>
                  <p>{t.reportDescription}</p>
                </div>
                <button className="admin-refresh" onClick={loadReports} disabled={loading}>
                  <RefreshCw size={17} className={loading ? 'admin-spin' : ''} />
                  {t.refreshShort}
                </button>
              </section>

              <section className="admin-report-summary">
                <div><strong>{reports.length}</strong><span>{t.submissions}</span></div>
                <div><strong>{count('pending')}</strong><span>{t.pending}</span></div>
                <div><strong>{count('in_progress')}</strong><span>{t.inProgress}</span></div>
                <div><strong>{count('resolved')}</strong><span>{t.resolved}</span></div>
              </section>

              <section className="admin-panel admin-management-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>{t.allSubmissions}</h2>
                    <p>{filteredReports.length} {t.found}</p>
                  </div>
                </div>

                <div className="admin-filters">
                  <div className="admin-search">
                    <Search size={18} />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder={t.searchPlaceholder}
                    />
                    {search && (
                      <button onClick={() => setSearch('')} aria-label={t.clearSearch}>
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="admin-filter-select">
                    <Filter size={16} />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="all">{t.allStatuses}</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{statusLabel(status)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-filter-select">
                    <ClipboardList size={16} />
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                      <option value="all">{t.allCategories}</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{categoryLabel(category)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="admin-error">
                    <AlertTriangle size={17} />
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="admin-empty">
                    <RefreshCw className="admin-spin" size={25} />
                    <p>{t.loadingEnvironmental}</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="admin-empty">
                    <FileText size={34} />
                    <h3>{t.noReports}</h3>
                    <p>{t.changeFilters}</p>
                  </div>
                ) : (
                  <div className="admin-report-grid">
                    {filteredReports.map(report => (
                      <article className="admin-report-card" key={report.id}>
                        <div className="admin-report-card-top">
                          <span className={`admin-status ${report.status}`}>
                            {statusLabel(report.status)}
                          </span>
                          <small>
                            <CalendarDays size={13} />
                            {formatDate(report.created_at, language)}
                          </small>
                        </div>

                        <h3>{categoryLabel(report.category)}</h3>
                        <p className="admin-report-description">
                          {report.description || t.noDescription}
                        </p>

                        <div className="admin-report-location">
                          <MapPin size={15} />
                          <span>{report.address || t.noLocation}</span>
                        </div>

                        <div className="admin-report-card-footer">
                          <span>
                            {report.photo_url ? (
                              <><Eye size={15} /> {t.evidence}</>
                            ) : t.noEvidence}
                          </span>
                          <button onClick={() => openReport(report)}>
                            {t.review}
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <footer className="admin-footer">
            <span><ShieldCheck size={15} /> {t.footer}</span>
            <span>{t.footerText}</span>
          </footer>
        </main>
      </div>

      {selectedReport && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">{t.reviewEyebrow}</span>
                <h2>{categoryLabel(selectedReport.category)}</h2>
                <span className="admin-modal-date">
                  {t.submitted} {formatDateTime(selectedReport.created_at, language)}
                </span>
              </div>
              <button onClick={() => setSelectedReport(null)} aria-label={t.closeReport}>
                <X size={22} />
              </button>
            </div>

            <div className="admin-modal-content">
              <div className="admin-modal-status-row">
                <span className={`admin-status ${selectedReport.status}`}>
                  {statusLabel(selectedReport.status)}
                </span>
              </div>

              <div className="admin-detail-block">
                <h3>{t.description}</h3>
                <p>{selectedReport.description || t.noDescription}</p>
              </div>

              <div className="admin-detail-block">
                <h3>{t.location}</h3>
                <p>
                  <MapPin size={16} />
                  {selectedReport.address || t.noAddress}
                </p>

                {selectedReport.lat != null && selectedReport.long != null && (
                  <a
                    className="admin-map-link"
                    href={`https://www.openstreetmap.org/?mlat=${selectedReport.lat}&mlon=${selectedReport.long}#map=16/${selectedReport.lat}/${selectedReport.long}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.openLocation}
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              {selectedReport.photo_url && (
                <div className="admin-detail-block">
                  <h3>{t.photograph}</h3>
                  <a href={selectedReport.photo_url} target="_blank" rel="noreferrer">
                    <img
                      className="admin-evidence"
                      src={selectedReport.photo_url}
                      alt={t.photograph}
                    />
                  </a>
                </div>
              )}

              <div className="admin-detail-block">
                <h3>{t.notes}</h3>
                <p className="admin-note-description">{t.notesDescription}</p>
                <textarea
                  value={notes[selectedReport.id] ?? selectedReport.moderator_note ?? ''}
                  onChange={e => setNotes(previous => ({
                    ...previous,
                    [selectedReport.id]: e.target.value
                  }))}
                  placeholder={t.notesPlaceholder}
                />
              </div>

              {actionMessage && (
                <div className={actionError ? 'admin-error' : 'admin-action-message'}>
                  {actionError
                    ? <AlertTriangle size={17} />
                    : <CheckCircle2 size={17} />}
                  {actionMessage}
                </div>
              )}

              <div className="admin-detail-block">
                <h3>{t.updateStatus}</h3>
                <p className="admin-note-description">{t.statusDescription}</p>

                <div className="admin-status-buttons">
                  {statuses.map(status => (
                    <button
                      key={status}
                      className={selectedReport.status === status ? 'active' : ''}
                      disabled={updatingId === selectedReport.id}
                      onClick={() => updateReport(selectedReport, status)}
                    >
                      {statusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="admin-primary admin-save-note"
                disabled={updatingId === selectedReport.id}
                onClick={() => updateReport(selectedReport, selectedReport.status)}
              >
                {updatingId === selectedReport.id ? t.saving : t.saveNotes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
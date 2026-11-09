import { useState } from 'react';
import { supabase } from './lib/supabase';
import {
  ArrowLeft, Camera, MapPin, Send,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import './ecoreport.css';

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
    eyebrow: 'ECOGUARD · COMMUNITY ACTION',
    title: 'Report an environmental issue.',
    subtitle: 'Help us identify environmental problems in your community. Every report makes a difference.',
    category: 'Type of environmental issue',
    description: 'Describe the problem',
    descriptionPlaceholder: 'Explain what happened and what you observed...',
    address: 'Location or address',
    addressPlaceholder: 'City, municipality, street...',
    currentLocation: 'Use my current location',
    locationCaptured: 'Location captured successfully.',
    locationError: 'Could not access your location. Enter the address manually.',
    locationUnsupported: 'Geolocation is not supported by your browser.',
    coordinates: 'Location captured:',
    photo: 'Evidence photo (optional)',
    choosePhoto: 'Choose a photo',
    invalidPhoto: 'Please choose a JPG, PNG or WebP image.',
    photoTooLarge: 'The image must be smaller than 5 MB.',
    notice: 'Reports are reviewed by moderators before being verified.',
    submit: 'Submit environmental report',
    submitting: 'Submitting...',
    successTitle: 'Report submitted!',
    successMessage: 'Your environmental report has been submitted for review!',
    successDescription: 'Your report is now awaiting moderator review.',
    databaseError: 'Database connection unavailable.',
    error: 'Something went wrong.',
    categories: {
      'Illegal dumping': 'Illegal dumping',
      'Air pollution': 'Air pollution',
      'Water pollution': 'Water pollution',
      'Overflowing bins': 'Overflowing bins',
      'Environmental damage': 'Environmental damage',
      Other: 'Other'
    }
  },

  ar: {
    back: 'العودة إلى ECOFIND',
    eyebrow: 'ECOGUARD · مبادرة مجتمعية',
    title: 'أبلغ عن مشكلة بيئية.',
    subtitle: 'ساعدنا في تحديد المشاكل البيئية في مجتمعك. كل بلاغ يُحدث فرقًا.',
    category: 'نوع المشكلة البيئية',
    description: 'صف المشكلة',
    descriptionPlaceholder: 'اشرح ما حدث وما الذي لاحظته...',
    address: 'الموقع أو العنوان',
    addressPlaceholder: 'المدينة، البلدية، الشارع...',
    currentLocation: 'استخدم موقعي الحالي',
    locationCaptured: 'تم تحديد الموقع بنجاح.',
    locationError: 'تعذر الوصول إلى موقعك. يرجى إدخال العنوان يدويًا.',
    locationUnsupported: 'متصفحك لا يدعم تحديد الموقع الجغرافي.',
    coordinates: 'تم تحديد الموقع:',
    photo: 'صورة كدليل (اختياري)',
    choosePhoto: 'اختر صورة',
    invalidPhoto: 'يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.',
    photoTooLarge: 'يجب أن يكون حجم الصورة أقل من 5 ميغابايت.',
    notice: 'تتم مراجعة البلاغات من قبل المشرفين قبل توثيقها.',
    submit: 'إرسال البلاغ البيئي',
    submitting: 'جارٍ الإرسال...',
    successTitle: 'تم إرسال البلاغ!',
    successMessage: 'تم إرسال بلاغك البيئي بنجاح للمراجعة!',
    successDescription: 'بلاغك الآن في انتظار مراجعة المشرفين.',
    databaseError: 'الاتصال بقاعدة البيانات غير متاح.',
    error: 'حدث خطأ غير متوقع.',
    categories: {
      'Illegal dumping': 'الرمي العشوائي للنفايات',
      'Air pollution': 'تلوث الهواء',
      'Water pollution': 'تلوث المياه',
      'Overflowing bins': 'امتلاء حاويات النفايات',
      'Environmental damage': 'الأضرار البيئية',
      Other: 'أخرى'
    }
  }
};

export default function EcoReport({ onBack, language = 'en' }) {
  const isArabic = language === 'ar';
  const t = translations[isArabic ? 'ar' : 'en'];

  const [form, setForm] = useState({
    category: 'Illegal dumping',
    description: '',
    address: '',
    lat: '',
    long: ''
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function getLocation() {
    if (!navigator.geolocation) {
      setMessage(t.locationUnsupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        update('lat', position.coords.latitude);
        update('long', position.coords.longitude);
        setMessage(t.locationCaptured);
      },
      () => {
        setMessage(t.locationError);
      }
    );
  }

  async function submit(e) {
    e.preventDefault();

    if (!supabase) {
      setMessage(t.databaseError);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      let photoUrl = null;

      if (photo) {
        const extension = photo.name.split('.').pop().toLowerCase();
        const filePath = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('environmental-evidence')
          .upload(filePath, photo, {
            contentType: photo.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('environmental-evidence')
          .getPublicUrl(filePath);

        photoUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('environmental_reports')
        .insert({
          user_id: null,
          category: form.category,
          description: form.description.trim(),
          address: form.address.trim() || null,
          lat: form.lat === '' ? null : Number(form.lat),
          long: form.long === '' ? null : Number(form.long),
          photo_url: photoUrl,
          status: 'pending',
          moderator_note: null
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setMessage(t.successMessage);

    } catch (error) {
      console.error(error);
      setMessage(error.message || t.error);
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div
        className="eco-report"
        dir={isArabic ? 'rtl' : 'ltr'}
        lang={language}
      >
        <div className="report-success">
          <CheckCircle2 size={52} />

          <h2>{t.successTitle}</h2>

          <p>{message}</p>

          <p>{t.successDescription}</p>

          <button onClick={onBack}>
            <ArrowLeft size={16} />
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="eco-report"
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={language}
    >
      <button className="report-back" onClick={onBack}>
        <ArrowLeft size={17} />
        {t.back}
      </button>

      <div className="report-heading">
        <span className="report-eyebrow">{t.eyebrow}</span>

        <h1>{t.title}</h1>

        <p>{t.subtitle}</p>
      </div>

      <form className="report-form" onSubmit={submit}>

        <label>
          {t.category}

          <select
            value={form.category}
            onChange={e => update('category', e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {t.categories[category]}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t.description}

          <textarea
            required
            minLength={10}
            maxLength={2000}
            placeholder={t.descriptionPlaceholder}
            value={form.description}
            onChange={e => update('description', e.target.value)}
          />
        </label>

        <label>
          {t.address}

          <input
            placeholder={t.addressPlaceholder}
            value={form.address}
            onChange={e => update('address', e.target.value)}
          />
        </label>

        <button
          type="button"
          className="report-location"
          onClick={getLocation}
        >
          <MapPin size={17} />
          {t.currentLocation}
        </button>

        {form.lat !== '' && (
          <p className="report-coordinates">
            {t.coordinates} {Number(form.lat).toFixed(5)}, {Number(form.long).toFixed(5)}
          </p>
        )}

        <label>
          {t.photo}

          <div className="report-upload">
            <Camera size={25} />

            <span>{photo ? photo.name : t.choosePhoto}</span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => {
                const file = e.target.files?.[0];

                if (!file) return;

                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                  setMessage(t.invalidPhoto);
                  e.target.value = '';
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  setMessage(t.photoTooLarge);
                  e.target.value = '';
                  return;
                }

                setPhoto(file);
                setMessage('');
              }}
            />
          </div>
        </label>

        {message && (
          <p className="report-message">
            <AlertTriangle size={16} />
            {message}
          </p>
        )}

        <div className="report-notice">
          <AlertTriangle size={17} />
          {t.notice}
        </div>

        <button
          className="report-submit"
          type="submit"
          disabled={loading}
        >
          <Send size={16} />
          {loading ? t.submitting : t.submit}
        </button>

      </form>
    </div>
  );
}
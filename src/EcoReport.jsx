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

export default function EcoReport({ onBack }) {
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
      setMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        update('lat', position.coords.latitude);
        update('long', position.coords.longitude);
        setMessage('Location captured successfully.');
      },
      () => {
        setMessage('Could not access your location. Enter the address manually.');
      }
    );
  }

  async function submit(e) {
    e.preventDefault();

    if (!supabase) {
      setMessage('Database connection unavailable.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      let photoUrl = null;

      // Upload photo if one was selected
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

      // Submit report
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
      setMessage('Your environmental report has been submitted for review!');

    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Something went wrong.');
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="eco-report">
        <div className="report-success">
          <CheckCircle2 size={52} />
          <h2>Report submitted!</h2>
          <p>{message}</p>
          <p>Your report is now awaiting moderator review.</p>

          <button onClick={onBack}>
            <ArrowLeft size={16} /> Back to ECOFIND
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="eco-report">
      <button className="report-back" onClick={onBack}>
        <ArrowLeft size={17} /> Back to ECOFIND
      </button>

      <div className="report-heading">
        <span className="report-eyebrow">ECOGUARD · COMMUNITY ACTION</span>
        <h1>Report an environmental issue.</h1>
        <p>
          Help us identify environmental problems in your community.
          Every report makes a difference.
        </p>
      </div>

      <form className="report-form" onSubmit={submit}>

        <label>
          Type of environmental issue
          <select
            value={form.category}
            onChange={e => update('category', e.target.value)}
          >
            {categories.map(category => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label>
          Describe the problem
          <textarea
            required
            minLength={10}
            maxLength={2000}
            placeholder="Explain what happened and what you observed..."
            value={form.description}
            onChange={e => update('description', e.target.value)}
          />
        </label>

        <label>
          Location or address
          <input
            placeholder="City, municipality, street..."
            value={form.address}
            onChange={e => update('address', e.target.value)}
          />
        </label>

        <button
          type="button"
          className="report-location"
          onClick={getLocation}
        >
          <MapPin size={17} /> Use my current location
        </button>

        {form.lat !== '' && (
          <p className="report-coordinates">
            Location captured: {Number(form.lat).toFixed(5)}, {Number(form.long).toFixed(5)}
          </p>
        )}

        <label>
          Evidence photo (optional)
          <div className="report-upload">
            <Camera size={25} />
            <span>{photo ? photo.name : 'Choose a photo'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => {
                const file = e.target.files?.[0];

                if (!file) return;

                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                  setMessage('Please choose a JPG, PNG or WebP image.');
                  e.target.value = '';
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  setMessage('The image must be smaller than 5 MB.');
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
            <AlertTriangle size={16} /> {message}
          </p>
        )}

        <div className="report-notice">
          <AlertTriangle size={17} />
          Reports are reviewed by moderators before being verified.
        </div>

        <button
          className="report-submit"
          type="submit"
          disabled={loading}
        >
          <Send size={16} />
          {loading ? 'Submitting...' : 'Submit environmental report'}
        </button>

      </form>
    </div>
  );
}
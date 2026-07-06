import React, { useState } from 'react';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', isError: false });

    try {
      const response = await fetch('/api/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        setStatus({ loading: false, message: 'Thank you! Your message has been saved and synced.', isError: false });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus({ loading: false, message: result.error || 'Submission failed.', isError: true });
      }
    } catch (error) {
      setStatus({ loading: false, message: 'Network error. Please try again later.', isError: true });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative Background Elements for YouTube ASMR Visuals */}
      <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -top-12 -left-12"></div>
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-12 -right-12"></div>

      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slideIn">
        
        {/* Info Box Section */}
        <div className="md:w-2/5 bg-gradient-to-b from-indigo-600 to-indigo-800 p-8 flex flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Get in touch</h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Have a premium system or platform requirement? Drop us a line. Our hybrid automation system guarantees secure multi-layer syncing.
            </p>
          </div>

          <div className="space-y-4 my-8 md:my-0">
            <div className="flex items-center space-x-3 text-sm text-indigo-100">
              <span className="text-lg">📍</span>
              <span>Auckland, New Zealand</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-indigo-100">
              <span className="text-lg">⏳</span>
              <span>Automated 24/7 Processing</span>
            </div>
          </div>

          <p className="text-xs text-indigo-300/80">Enterprise Ready Pipeline v1.0</p>
        </div>

        {/* Form Part Section */}
        <form onSubmit={handleSubmit} className="md:w-3/5 p-8 flex flex-col justify-between space-y-5 bg-slate-900/40">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+64..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Message</label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project infrastructure needs..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex justify-center items-center shadow-lg shadow-indigo-600/20"
          >
            {status.loading ? 'Processing System...' : 'Deploy Submission'}
          </button>
        </form>
      </div>

      {/* Modern Feedback Toast Notification Popup */}
      {status.message && (
        <div className={`fixed bottom-6 right-6 px-6 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm transition-all animate-bounce ${
          status.isError ? 'bg-red-950/80 border-red-500/30 text-red-200' : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
        }`}>
          <p className="text-sm font-semibold">{status.isError ? '🛑 System Alert' : '✅ Sync Dynamic Completed'}</p>
          <p className="text-xs opacity-90 mt-1">{status.message}</p>
        </div>
      )}
    </div>
  );
}
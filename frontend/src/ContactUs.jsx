// Import the core React library and the useState hook for managing local state within the component
import React, { useState } from 'react';

// Define and export the main functional component ContactUs as the default export
export default function ContactUs() {
  // Initialize state 'formData' to hold form input values with default empty string values
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  
  // Initialize state 'status' to track form submission lifecycle (loading indicator, user feedback, error flag)
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });

  // Event handler triggered whenever an input or textarea value changes
  const handleChange = (e) => {
    // Dynamically update the specific property in 'formData' matching the input's 'name' attribute
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Asynchronous event handler triggered when the form is submitted
  const handleSubmit = async (e) => {
    // Prevent the default browser form submission (which reloads the page)
    e.preventDefault();
    
    // Set loading state to true and clear any previous status messages
    setStatus({ loading: true, message: '', isError: false });

    // Enclose network request in a try-catch block for safe execution
    try {
      // Send an HTTP POST request to backend API endpoint '/api/add-user' with input data serialized as JSON
      const response = await fetch('/api/add-user', {
        method: 'POST', // Specify the HTTP request method
        headers: { 'Content-Type': 'application/json' }, // Tell backend the request body contains JSON data
        body: JSON.stringify(formData), // Convert the JavaScript object into a JSON string
      });

      // Parse the JSON data received in the response body from the backend
      const result = await response.json();

      // Check if the HTTP response status code indicates success (200-299 status range)
      if (response.ok) {
        // Set success message, disable loading state, and mark error flag as false
        setStatus({
          loading: false,
          message: 'Thank you! Your message has been sent successfully.',
          isError: false,
        });
        // Clear all form input fields back to their initial empty values
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        // Handle server-side errors (e.g. status code 400 or 500) using backend error message or default text
        setStatus({
          loading: false,
          message: result.error || 'Submission failed. Please try again.',
          isError: true,
        });
      }
    } catch (error) {
      // Handle network errors (e.g. server down or lost internet connection)
      setStatus({
        loading: false,
        message: 'Network error. Please check your connection.',
        isError: true,
      });
    }
  };

  // Render the JSX structure for the user interface
  return (
    // Outer page container with Tailwind CSS classes for dark gradient background and centering
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative blurred background orb positioned on top-left */}
      <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -top-12 -left-12"></div>
      
      {/* Decorative blurred background orb positioned on bottom-right */}
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-12 -right-12"></div>

      {/* Main content card container with semi-transparent background and blur effect */}
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slideIn">
        
        {/* Left side panel displaying informational content */}
        <div className="md:w-2/5 bg-gradient-to-b from-indigo-600 to-indigo-800 p-8 flex flex-col justify-between text-white">
          {/* Container for header text */}
          <div>
            {/* Title heading */}
            <h2 className="text-3xl font-bold tracking-tight mb-4">Get in touch</h2>
            {/* Subheading description text */}
            <p className="text-indigo-200 text-sm leading-relaxed">
              Have a question or requirement? Send us a message and our system will deliver it directly to our dashboard.
            </p>
          </div>

          {/* List of contact detail items */}
          <div className="space-y-4 my-8 md:my-0">
            {/* Location info item */}
            <div className="flex items-center space-x-3 text-sm text-indigo-100">
              <span className="text-lg">📍</span>
              <span>Auckland, New Zealand</span>
            </div>
            {/* Status info item */}
            <div className="flex items-center space-x-3 text-sm text-indigo-100">
              <span className="text-lg">⏳</span>
              <span>Automated Processing</span>
            </div>
          </div>

          {/* Version badge text */}
          <p className="text-xs text-indigo-300/80">Enterprise Ready Pipeline v1.0</p>
        </div>

        {/* Right side form section attached to handleSubmit function */}
        <form onSubmit={handleSubmit} className="md:w-3/5 p-8 flex flex-col justify-between space-y-5 bg-slate-900/40">
          {/* Input fields wrapper */}
          <div className="space-y-4">
            {/* Container for Full Name field */}
            <div>
              {/* Field label */}
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              {/* Controlled text input for Name bound to formData.name */}
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

            {/* Grid layout splitting Email and Phone into two columns on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Container for Email Address field */}
              <div>
                {/* Field label */}
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                {/* Controlled email input bound to formData.email */}
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
              {/* Container for Phone Number field */}
              <div>
                {/* Field label */}
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                {/* Controlled text input bound to formData.phone */}
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

            {/* Container for Message textarea field */}
            <div>
              {/* Field label */}
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Your Message
              </label>
              {/* Controlled multi-line text input bound to formData.message */}
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          {/* Form submit button; disabled while form submission is active */}
          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex justify-center items-center shadow-lg shadow-indigo-600/20"
          >
            {/* Conditional button text depending on whether request is pending */}
            {status.loading ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Floating toast notification banner rendered only when status.message has text */}
      {status.message && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm transition-all ${
            status.isError
              ? 'bg-red-950/80 border-red-500/30 text-red-200'
              : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
          }`}
        >
          {/* Notification header indicating error or success state */}
          <p className="text-sm font-semibold">{status.isError ? 'System Alert' : 'Success'}</p>
          {/* Detailed notification description message */}
          <p className="text-xs opacity-90 mt-1">{status.message}</p>
        </div>
      )}
    </div>
  );
}
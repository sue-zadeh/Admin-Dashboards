// Import essential React hooks (useEffect for side effects, useState for component state)
import React, { useEffect, useState } from 'react'

// Import AOS (Animate On Scroll) JS library and its corresponding CSS styling
import AOS from 'aos'
import 'aos/dist/aos.css'

// Import specific FontAwesome icons from react-icons/fa package
import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa'

// Import background image asset relative to frontend source path
import Contactpic from '/assets/home2.png'

// Define and export main Contactus functional component
export default function Contactus() {
  // Initialize AOS animation library when component mounts
  useEffect(() => {
    AOS.init({
      duration: 900, // Animation duration in milliseconds
      once: false,    // Whether animation should happen only once while scrolling down
      mirror: true,   // Whether elements should animate out while scrolling past them
    })
    AOS.refresh()     // Recalculate positions and offsets of elements
  }, [])              // Empty dependency array ensures run on mount only

  // Define controlled state object for holding all contact form inputs
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    enquiryType: '',
    message: '',
  })

  // State object to hold field-specific validation error messages
  const [errors, setErrors] = useState({})

  // State object for managing user notification popup visibility, style, and text
  const [popup, setPopup] = useState({ show: false, type: 'success', text: '' })

  // Boolean flag to track form submission pending state
  const [submitting, setSubmitting] = useState(false)

  // Event handler for updating form state dynamically as user inputs text
  const onChange = (e) => {
    // Dynamically update property in 'form' matching target input's name attribute
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

    // Clear active validation error message for target input once user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  // Pure function performing validation checks against current form state
  const validate = () => {
    const e = {} // Temporary object to collect error messages

    // Name field validation
    if (!form.name.trim()) e.name = 'Name is required'

    // Email field presence and format validation via regular expression
    if (!form.email.trim()) {
      e.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Invalid email format'
    }

    // Enquiry type dropdown validation
    if (!form.enquiryType) {
      e.enquiryType = 'Please select what you are enquiring about'
    }

    // Message field validation
    if (!form.message.trim()) {
      e.message = 'Message is required'
    }

    return e // Return populated errors object
  }

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent full page reload on submit
    if (submitting) return // Guard against duplicate submissions while pending

    // Run client-side validation
    const validationErrors = validate()
    setErrors(validationErrors)

    // Halt submission process if any validation errors are returned
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true) // Set submitting flag to disable button and show loading state

    try {
      // POST request sending form object as JSON to API route
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      // Handle server error responses
      if (!res.ok) {
        setPopup({
          show: true,
          type: 'error',
          text: data.error || 'Something went wrong. Please try again.',
        })
      } else {
        // Reset form inputs upon successful request
        setForm({
          name: '',
          email: '',
          phone: '',
          enquiryType: '',
          message: '',
        })
        setErrors({})
        // Trigger success popup notification
        setPopup({
          show: true,
          type: 'success',
          text: 'Thank you for contacting us! We’ll get back to you as soon as possible.',
        })
        // Automatically hide popup notification after 6 seconds
        setTimeout(() => setPopup({ show: false }), 6000)
      }
    } catch {
      // Catch network-level connectivity errors
      setPopup({
        show: true,
        type: 'error',
        text: 'Network error. Please try again.',
      })
    } finally {
      setSubmitting(false) // Reset submitting state regardless of outcome
    }
  }

  return (
    // Outer section container with inline background image setup and AOS scroll effects
    <section
      id="contact-us"
      className="sp-contact-page mt-5"
      style={{
        backgroundImage: `url(${Contactpic})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '5px solid #97dbecff',
        borderTop: '5px solid #97dbecff',
      }}
    >
      <div className="sp-contact-overlay">
        <div className="container py-3">
          
          {/* Header section displaying title and contact info with AOS animation */}
          <div
            className="text-center text-light fw-semibold p-3"
            data-aos="fade-down"
          >
            <h1 className="mb-2">GET IN TOUCH</h1>
            <div className="d-flex flex-column align-items-center gap-3 fs-5">
              <div className="d-flex align-items-center gap-3">
                <FaPhoneAlt className="fs-3" />
                <span>Phone: 021 254 0300</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <FaEnvelope className="fs-3" />
                <span>Email: karol@showerpower.co.nz</span>
              </div>
            </div>
          </div>

          {/* Conditional rendering for alert feedback popup modal/toast */}
          {popup.show && (
            <div
              className={`popup ${popup.type === 'error' ? 'popup--error' : 'popup--success'}`}
            >
              <p className="fs-5 mb-0">{popup.text}</p>
            </div>
          )}

          {/* Form wrapper grid structure */}
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-9">
              <div
                className="sp-contact-box p-4 p-md-5 rounded-4 shadow-lg"
                data-aos="fade-up"
              >
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    
                    {/* Left Column Input Controls */}
                    <div className="col-lg-5">
                      {/* Name Input */}
                      <div className="mb-3">
                        <input
                          name="name"
                          value={form.name}
                          onChange={onChange}
                          placeholder="Your Name *"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name}</div>
                        )}
                      </div>

                      {/* Email Input */}
                      <div className="mb-3">
                        <input
                          name="email"
                          value={form.email}
                          onChange={onChange}
                          placeholder="Your Email *"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      {/* Phone Input (Optional) */}
                      <div className="mb-3">
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={onChange}
                          placeholder="Phone (optional)"
                          className="form-control"
                        />
                      </div>

                      {/* Enquiry Type Dropdown Select */}
                      <div className="mb-3">
                        <select
                          name="enquiryType"
                          value={form.enquiryType}
                          onChange={onChange}
                          className={`form-select ${errors.enquiryType ? 'is-invalid' : ''}`}
                        >
                          <option value="">What are you enquiring about? *</option>
                          <option value="New Shower Install">New Shower Install</option>
                          <option value="Shower Repairs">Shower Repairs</option>
                          <option value="Acrylic Repairs">Acrylic Repairs</option>
                          <option value="Glass Restoration">Glass Restoration</option>
                          <option value="EnduroShield">EnduroShield</option>
                          <option value="Bathroom Renovation">Bathroom Renovation</option>
                          <option value="General Enquiry">General Enquiry</option>
                          <option value="Showerdome">Showerdome</option>
                        </select>
                        {errors.enquiryType && (
                          <div className="invalid-feedback">
                            {errors.enquiryType}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column Message Field */}
                    <div className="col-lg-7">
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={onChange}
                        placeholder="Your Message *"
                        rows="8"
                        className={`form-control h-100 ${errors.message ? 'is-invalid' : ''}`}
                      />
                      {errors.message && (
                        <div className="invalid-feedback d-block">
                          {errors.message}
                        </div>
                      )}
                    </div>

                    {/* Submit Action Button */}
                    <div className="col-12 d-flex justify-content-center pt-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-warning px-5 rounded-4 sp-nav-cta sp-cta-press"
                        style={{
                          minWidth: 180,
                          backgroundColor: '#97dbecff',
                          opacity: submitting ? 0.7 : 1,
                        }}
                      >
                        {submitting ? 'Sending...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Section: Why Choose Us feature list with staggered AOS animations */}
          <div className="sp-why-wrap my-5 py-5" data-aos="fade-up">
            <div className="sp-why-card mx-auto">
              <h3
                className="text-center mb-5 fw-bold display-5"
                data-aos="fade-up"
                data-aos-delay="0"
              >
                Why Choose Us?
              </h3>

              <div className="sp-why-grid">
                <div
                  className="sp-why-item"
                  data-aos="fade-up"
                  data-aos-delay="0"
                >
                  <p className="sp-p mb-0">
                    <strong>Experience and Expertise:</strong> Years of hands-on
                    experience delivering reliable workmanship across Northland.
                  </p>
                </div>

                <div
                  className="sp-why-item"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <p className="sp-p mb-0">
                    <strong>Customer First Approach:</strong> Clear
                    communication, genuine advice, and personalised service
                    every step of the way.
                  </p>
                </div>

                <div
                  className="sp-why-item"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <p className="sp-p mb-0">
                    <strong>Quality Materials:</strong> We use trusted products
                    to ensure long-lasting, leak-free, beautiful results.
                  </p>
                </div>

                <div
                  className="sp-why-item"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <p className="sp-p mb-0">
                    <strong>Transparent Pricing:</strong> No surprises - just
                    clear, upfront quotes so you know exactly what to expect.
                  </p>
                </div>

                <div
                  className="sp-why-item sp-why-item-wide"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  <p className="sp-p mb-0">
                    <strong>Reliable & On-Time:</strong> We respect your time
                    and stick to schedules while maintaining high standards of
                    workmanship.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
import React from 'react'

export default function ContactFrom() {
  return (
    <>
      <h2>Contact Me</h2>
      <p>
        Currently
        <span
          style={{
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: 'green',
            paddingLeft: 5,
            paddingRight: 5,
          }}
        >
          available
        </span>
        for full or contract work&#x2c; feel free to contact me.
      </p>
      <div className="row">
        <div className="12u 12u$(small)">
          <form
            method="POST"
            name="contact"
            action="/confirmation"
            netlify-honeypot="bot-field"
            data-netlify="true"
          >
            <input type="hidden" name="form-name" value="contact" />
            <p className="hidden" style={{ display: 'none' }}>
              <label>
                Don&#x27;t fill this out if you&#x27;re human:
                <input name="bot-field" />
              </label>
            </p>
            <div className="row uniform 50%">
              <div className="6u 12u$(xsmall)">
                <label>
                  <span className="sr-text">name</span>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Name"
                    required
                  />
                </label>
              </div>
              <div className="6u 12u$(xsmall)">
                <label>
                  <span className="sr-text">email</span>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    required
                  />
                </label>
              </div>
              <div className="12u">
                <label>
                  <span className="sr-text">message</span>
                  <textarea
                    name="message"
                    id="message"
                    placeholder="Message"
                    rows="4"
                    required
                  ></textarea>
                </label>
              </div>
            </div>
            <p className="actions" style={{ marginTop: 30 }}>
              <button className="button" type="submit">
                Send Message
              </button>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

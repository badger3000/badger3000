import React from 'react'

export default function ContactFrom() {
  return (
    <>
      <div className="mt-6">
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
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col justify-between md:flex-row">
              <div className=" flex-grow sm:mb-6 md:mr-3">
                <label className="block">
                  <span className="sr-only">name</span>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Name"
                    required
                    className="mt-1
                block
                w-full
                rounded-md
                border-transparent
                bg-gray-100
                transition-[border] focus:border-gray-500 focus:bg-white focus:ring-0"
                  />
                </label>
              </div>
              <div className="flex-grow md:ml-3">
                <label className="block">
                  <span className="sr-only">email</span>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    required
                    className="mt-1
                block
                w-full
                rounded-md
                border-transparent
                bg-gray-100
                transition-[border] focus:border-gray-500 focus:bg-white focus:ring-0"
                  />
                </label>
              </div>
            </div>
            <label className="block">
              <span className="sr-only">message</span>
              <textarea
                name="message"
                id="message"
                placeholder="Message"
                rows="4"
                required
                className="mt-1
                block
                w-full
                rounded-md
                border-transparent
                bg-gray-100
                transition-[border] focus:border-gray-500 focus:bg-white focus:ring-0"
              ></textarea>
            </label>
          </div>
          <p className="actions mt-6">
            <button
              className="rounded-lg border-[3px] border-solid border-[#efefef] px-6 py-4 transition-all duration-700	ease-in-out hover:border-[#075841] hover:text-[#075841]	"
              type="submit"
            >
              Send Message
            </button>
          </p>
        </form>
      </div>
    </>
  )
}

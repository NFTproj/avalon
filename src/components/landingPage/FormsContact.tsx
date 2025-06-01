'use client'

import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'
import ImageFromJSON from '../core/ImageFromJSON'

function FormsContact() {
  const { texts, colors } = useContext(ConfigContext)
  const support = texts?.['landing-page']['forms-contact'].support
  const formContact = texts?.['landing-page']['forms-contact'].form

  return (
    <section
      style={{ backgroundColor: colors?.background['background-sixteen'] }}
      className="flex flex-col items-center relative w-full mt-12 md:mt-24 sm:mt-50 lg:mt-40 gap-2 md:gap-0"
    >
      <div className="flex flex-col gap-2 md:gap-2 w-full px-4 md:px-8 lg:px-20 py-6 md:py-12 relative">
        <div
          className="relative w-full border-1 border-gray-300 h-60 sm:h-[300px] md:h-[400px] I. md:border-0 z-10 -translate-y-1/2 md:translate-x-0 rounded-lg overflow-hidden"
          style={{
            backgroundColor: colors?.background['background-primary'],
          }}
        >
          <div className="hidden md:block w-full h-full">
            <ImageFromJSON
              src={support?.image}
              alt={support?.alt}
              className="w-full h-full"
              responsive
              width={1200}
              height={1000}
            />
          </div>
          <div className="absolute top-0 w-full md:w-[40%] h-full flex flex-col justify-center gap-4 p-6 md:p-8">
            <h2
              className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {support?.title}
            </h2>
            <p
              className="text-sm md:text-base lg:text-lg p-2 rounded"
              style={{ color: colors?.colors['color-secondary'] }}
            >
              {support?.description}
            </p>
            <a
              href={`mailto:${support?.email}`}
              className="inline-block text-center w-full md:w-auto px-6 py-3 text-white font-bold rounded-md shadow hover:opacity-90"
              style={{
                backgroundColor: colors?.buttons['button-primary'],
                color: colors?.colors['color-primary'],
              }}
            >
              {support?.email}
            </a>
          </div>
        </div>
        <div className="flex justify-center items-center flex-col gap-8 md:gap-16 px-4 md:px-16 py-6 md:py-12 w-full">
          <h2
            className="font-bold text-3xl md:text-5xl text-center"
            style={{ color: colors?.colors['color-quintenary'] }}
          >
            {formContact?.title}
          </h2>
          <form
            action=""
            className="flex flex-col items-center gap-12 md:gap-24 w-full md:w-3/4"
            style={{ color: colors?.colors['color-quintenary'] }}
          >
            <div className="flex flex-col items-center gap-4 md:gap-6 w-full md:w-3/4">
              <label
                htmlFor="name-input"
                className="flex flex-col gap-1 w-full font-bold"
              >
                {formContact?.name?.label}
                <input
                  type="text"
                  placeholder={formContact?.name?.placeholder}
                  className="border-2 border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none"
                  required
                  id="name-input"
                  style={{
                    backgroundColor: colors?.background['background-primary'],
                    color: colors?.colors['color-primary'],
                  }}
                />
              </label>
              <label
                htmlFor="email-input"
                className="flex flex-col gap-1 w-full font-bold"
              >
                {formContact?.email?.label}
                <input
                  type="email"
                  placeholder={formContact?.email?.placeholder}
                  className="border-2 border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none"
                  required
                  id="email-input"
                  style={{
                    backgroundColor: colors?.background['background-primary'],
                    color: colors?.colors['color-primary'],
                  }}
                />
              </label>
              <label
                htmlFor="phone-input"
                className="flex flex-col gap-1 w-full font-bold"
              >
                {formContact?.phone?.label}
                <input
                  type="tel"
                  placeholder={formContact?.phone?.placeholder}
                  className="border-2 border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none"
                  required
                  id="phone-input"
                  style={{
                    backgroundColor: colors?.background['background-primary'],
                    color: colors?.colors['color-primary'],
                  }}
                />
              </label>
              <label
                htmlFor="message-input"
                className="flex flex-col gap-1 w-full font-bold"
              >
                {formContact?.message?.label}
                <textarea
                  placeholder={formContact?.message?.placeholder}
                  className="border-2 border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none"
                  required
                  id="message-input"
                  style={{
                    backgroundColor: colors?.background['background-primary'],
                    color: colors?.colors['color-primary'],
                    minHeight: 100,
                  }}
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-20 py-3 rounded-md font-bold"
              style={{
                backgroundColor: colors?.buttons['button-primary'],
                color: colors?.colors['color-primary'],
              }}
            >
              {formContact?.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default FormsContact

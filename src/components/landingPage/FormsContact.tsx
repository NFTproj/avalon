'use client'

import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'
import ImageFromJSON from '../core/ImageFromJSON'
import { text } from 'stream/consumers'

function FormsContact() {
  const { texts, colors } = useContext(ConfigContext)
  const support = texts?.['landing-page']['forms-contact'].support
  const formContact = texts?.['landing-page']['forms-contact'].form

  return (
    <section
      style={{ backgroundColor: colors?.background['background-sixteen'] }}
      className="flex flex-col items-center relative w-full mt-24"
    >
      <div className="flex flex-col gap-20 w-full">
        <div className="relative w-full px-16">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white"></div>
          <ImageFromJSON
            src={support?.image}
            alt={support?.alt}
            className="w-full relative"
          />
        </div>

        <div className="flex justify-center items-center flex-col gap-16 px-16 py-12 w-full">
          <h2
            className="font-bold text-5xl"
            style={{ color: colors?.colors['color-quintenary'] }}
          >
            {formContact?.title}
          </h2>

          <form
            action=""
            className="flex flex-col items-center gap-24 w-3/4"
            style={{ color: colors?.colors['color-quintenary'] }}
          >
            <div className="flex flex-col items-center gap-6 w-3/4">
              <label
                htmlFor="name-input"
                className="flex flex-col gap-1 w-full font-bold"
              >
                {formContact?.name?.label}
                <input
                  type="text"
                  placeholder={formContact?.name?.placeholder}
                  className="border-2 border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none font-normal"
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
                htmlFor="email-input"
                className="flex flex-col gap-1 w-full font-bold"
              >
                {formContact?.phone?.label}
                <input
                  type="email"
                  placeholder={formContact?.phone?.placeholder}
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
            <button type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default FormsContact

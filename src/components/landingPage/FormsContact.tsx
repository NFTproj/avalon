'use client'

import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import ImageFromJSON from '../core/ImageFromJSON'

function FormsContact() {
  const { texts, colors } = useContext(ConfigContext)
  const support = texts?.['landing-page']['forms-contact'].support
  const formContact = texts?.['landing-page']['forms-contact'].form

  // Estados do formulário
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFieldErrors, setShowFieldErrors] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Função de envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Limpa mensagens anteriores
    setSubmitStatus({ type: null, message: '' })
    setShowFieldErrors(false)

    // Limpa e valida campos obrigatórios
    const name = formValues.name.trim()
    const email = formValues.email.trim()
    const phone = formValues.phone.trim()
    const message = formValues.message.trim()

    // Valida campos obrigatórios
    if (!name || !email || !message) {
      setShowFieldErrors(true)
      setSubmitStatus({
        type: 'error',
        message: 'Por favor, preencha todos os campos obrigatórios.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Faz requisição POST para a API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          company: phone || undefined, // Usa phone como company (opcional)
          message,
          services: selectedServices.length > 0 ? selectedServices : undefined,
        }),
      })

      // Processa resposta
      const data = await response.json()

      if (response.ok) {
        // Sucesso: limpa formulário e mostra mensagem
        setSubmitStatus({
          type: 'success',
          message:
            'Formulário enviado com sucesso! Entraremos em contato em breve.',
        })

        // Limpa campos
        setFormValues({
          name: '',
          email: '',
          phone: '',
          message: '',
        })
        setSelectedServices([])
        setShowFieldErrors(false)
      } else {
        // Erro: mostra mensagem de erro
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Erro ao enviar mensagem. Tente novamente.',
        })
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Erro ao enviar mensagem. Tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col items-center gap-12 md:gap-24 w-full md:w-3/4"
            style={{ color: colors?.colors['color-quintenary'] }}
          >
            {/* Mensagem de feedback */}
            {submitStatus.type && (
              <div
                className="w-full md:w-3/4 rounded-xl border-2 px-4 py-3 shadow-sm flex items-start gap-3"
                style={{
                  backgroundColor:
                    submitStatus.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  borderColor:
                    submitStatus.type === 'success' ? '#22C55E' : '#EF4444',
                  color:
                    submitStatus.type === 'success' ? '#166534' : '#991B1B',
                }}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {submitStatus.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5" aria-hidden />
                  ) : (
                    <XCircle className="h-5 w-5" aria-hidden />
                  )}
                </span>
                <p className="text-sm font-medium flex-1">
                  {submitStatus.message}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitStatus({ type: null, message: '' })}
                  className="ml-2 rounded p-1 hover:opacity-80 flex-shrink-0"
                  aria-label="Fechar"
                  style={{
                    color:
                      submitStatus.type === 'success' ? '#166534' : '#991B1B',
                  }}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            )}

            <div className="flex flex-col items-center gap-4 md:gap-6 w-full md:w-3/4">
              <label
                htmlFor="name-input"
                className="flex flex-col gap-1 w-full font-bold"
              >
                {formContact?.name?.label}
                <input
                  type="text"
                  placeholder={formContact?.name?.placeholder}
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`border-2 rounded-md px-4 py-2 w-full focus:outline-none ${
                    showFieldErrors && !formValues.name.trim()
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  required
                  id="name-input"
                  disabled={isSubmitting}
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
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={`border-2 rounded-md px-4 py-2 w-full focus:outline-none ${
                    showFieldErrors && !formValues.email.trim()
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  required
                  id="email-input"
                  disabled={isSubmitting}
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
                  value={formValues.phone}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="border-2 border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none"
                  id="phone-input"
                  disabled={isSubmitting}
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
                  value={formValues.message}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className={`border-2 rounded-md px-4 py-2 w-full focus:outline-none ${
                    showFieldErrors && !formValues.message.trim()
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  required
                  id="message-input"
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
              className={`w-full md:w-auto px-20 py-3 rounded-md font-bold transition-opacity ${
                isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: colors?.buttons['button-primary'],
                color: colors?.colors['color-primary'],
              }}
            >
              {isSubmitting ? 'Enviando...' : formContact?.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default FormsContact

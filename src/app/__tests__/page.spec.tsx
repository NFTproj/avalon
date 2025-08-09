import { render, screen } from '@testing-library/react'
import { ConfigContext } from '../../contexts/ConfigContext'
import Home from '../page'
import React from 'react'


jest.mock('../../components/common/footer', () => {

  return function MockFooter() {
    return <div data-testid="footer">Footer Component</div>
  }
})

jest.mock('../../components/landingPage/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header Component</div>
  }
})

jest.mock('../../components/landingPage/Hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Hero Component</div>
  }
})

jest.mock('../../components/landingPage/TokenizationSteps', () => {
  return function MockTokenizationSteps() {
    return <div data-testid="tokenization-steps">Tokenization Steps Component</div>
  }
})

jest.mock('../../components/landingPage/TokenShowcase', () => {
  return function MockTokenShowcase() {
    return <div data-testid="token-showcase">Token Showcase Component</div>
  }
})

jest.mock('../../components/landingPage/FaqTabs', () => {
  return function MockFaqTabs({ title, questions }: { title?: string; questions: any[] }) {
    return (
      <div data-testid="faq-tabs">
        <div data-testid="faq-title">{title}</div>
        <div data-testid="faq-questions-count">{questions.length}</div>
      </div>
    )
  }
})

jest.mock('../../components/landingPage/FeaturesShowcase', () => {
  return function MockFeaturesShowcase() {
    return <div data-testid="features-showcase">FeaturesShowcase Component</div>
  }
})

jest.mock('../../components/landingPage/FormsContact', () => {
  return function MockFormsContact() {
    return <div data-testid="forms-contact">FormsContact Component</div>
  }
})

// Mock data para testes
const mockConfigContextBloxify = {
  config: null,
  texts: {
    'landing-page': {
      faq: {
        title: 'Perguntas Frequentes',
        questions: [
          { id: 1, question: 'Pergunta 1', answer: 'Resposta 1' },
          { id: 2, question: 'Pergunta 2', answer: 'Resposta 2' }
        ]
      }
    }
  },
  colors: {
    background: {
      'background-primary': '#ffffff'
    }
  },
  locale: 'pt-BR',
  setLocale: jest.fn(),
  client: 'bloxify',
  isBloxify: true
}

const mockConfigContextNonBloxify = {
  ...mockConfigContextBloxify,
  client: 'slab',
  isBloxify: false
}

// Componente wrapper para prover o contexto
function TestWrapper({ children, contextValue }: { children: React.ReactNode; contextValue: any }) {
  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  )
}

describe('Home Page', () => {
  describe('Common Components', () => {
    it('should render Header, Hero, TokenizationSteps and Footer for all clients', () => {
      render(
        <TestWrapper contextValue={mockConfigContextBloxify}>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('hero')).toBeInTheDocument()
      expect(screen.getByTestId('tokenization-steps')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('should apply background color from context', () => {
      const { container } = render(
        <TestWrapper contextValue={mockConfigContextBloxify}>
          <Home />
        </TestWrapper>
      )

      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveStyle('background-color: #ffffff')
    })
  })

  describe('Bloxify Client (isBloxify: true)', () => {
    it('should render FeaturesShowcase and FormsContact when isBloxify is true', () => {
      render(
        <TestWrapper contextValue={mockConfigContextBloxify}>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByTestId('features-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('forms-contact')).toBeInTheDocument()
    })

    it('should NOT render TokenShowcase and FaqTabs when isBloxify is true', () => {
      render(
        <TestWrapper contextValue={mockConfigContextBloxify}>
          <Home />
        </TestWrapper>
      )

      expect(screen.queryByTestId('token-showcase')).not.toBeInTheDocument()
      expect(screen.queryByTestId('faq-tabs')).not.toBeInTheDocument()
    })
  })

  describe('Non-Bloxify Client (isBloxify: false)', () => {
    it('should render TokenShowcase and FaqTabs when isBloxify is false', () => {
      render(
        <TestWrapper contextValue={mockConfigContextNonBloxify}>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByTestId('token-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('faq-tabs')).toBeInTheDocument()
    })

    it('should NOT render FeaturesShowcase and FormsContact when isBloxify is false', () => {
      render(
        <TestWrapper contextValue={mockConfigContextNonBloxify}>
          <Home />
        </TestWrapper>
      )

      expect(screen.queryByTestId('features-showcase')).not.toBeInTheDocument()
      expect(screen.queryByTestId('forms-contact')).not.toBeInTheDocument()
    })

    it('should pass correct props to FaqTabs component', () => {
      render(
        <TestWrapper contextValue={mockConfigContextNonBloxify}>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByTestId('faq-title')).toHaveTextContent('Perguntas Frequentes')
      expect(screen.getByTestId('faq-questions-count')).toHaveTextContent('2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing colors gracefully', () => {
      const contextWithoutColors = {
        ...mockConfigContextBloxify,
        colors: null
      }

      const { container } = render(
        <TestWrapper contextValue={contextWithoutColors}>
          <Home />
        </TestWrapper>
      )

      const mainDiv = container.firstChild as HTMLElement
      // When colors is null, the component should still render without crashing
      expect(mainDiv).toBeInTheDocument()
    })

    it('should handle missing FAQ data gracefully', () => {
      const contextWithoutFaq = {
        ...mockConfigContextNonBloxify,
        texts: {
          'landing-page': {
            faq: {
              title: undefined,
              questions: undefined
            }
          }
        }
      }

      render(
        <TestWrapper contextValue={contextWithoutFaq}>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByTestId('faq-tabs')).toBeInTheDocument()
      expect(screen.getByTestId('faq-questions-count')).toHaveTextContent('0')
    })

    it('should handle completely missing texts gracefully', () => {
      const contextWithoutTexts = {
        ...mockConfigContextNonBloxify,
        texts: null
      }

      render(
        <TestWrapper contextValue={contextWithoutTexts}>
          <Home />
        </TestWrapper>
      )

      expect(screen.getByTestId('faq-tabs')).toBeInTheDocument()
      expect(screen.getByTestId('faq-questions-count')).toHaveTextContent('0')
    })
  })

  describe('Component Structure', () => {
    it('should have correct HTML structure', () => {
      const { container } = render(
        <TestWrapper contextValue={mockConfigContextBloxify}>
          <Home />
        </TestWrapper>
      )

      // Verifica se existe um div principal
      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv.tagName).toBe('DIV')

      // Verifica se existe um elemento main
      const mainElement = container.querySelector('main')
      expect(mainElement).toBeInTheDocument()
    })

    it('should render components in correct order for Bloxify', () => {
      render(
        <TestWrapper contextValue={mockConfigContextBloxify}>
          <Home />
        </TestWrapper>
      )

      const components = [
        screen.getByTestId('header'),
        screen.getByTestId('hero'),
        screen.getByTestId('tokenization-steps'),
        screen.getByTestId('features-showcase'),
        screen.getByTestId('forms-contact'),
        screen.getByTestId('footer')
      ]

      // Verifica se os componentes estão na ordem correta no DOM
      for (let i = 0; i < components.length - 1; i++) {
        expect(components[i].compareDocumentPosition(components[i + 1]))
          .toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      }
    })

    it('should render components in correct order for non-Bloxify', () => {
      render(
        <TestWrapper contextValue={mockConfigContextNonBloxify}>
          <Home />
        </TestWrapper>
      )

      const components = [
        screen.getByTestId('header'),
        screen.getByTestId('hero'),
        screen.getByTestId('tokenization-steps'),
        screen.getByTestId('token-showcase'),
        screen.getByTestId('faq-tabs'),
        screen.getByTestId('footer')
      ]

      // Verifica se os componentes estão na ordem correta no DOM
      for (let i = 0; i < components.length - 1; i++) {
        expect(components[i].compareDocumentPosition(components[i + 1]))
          .toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      }
    })
  })
})
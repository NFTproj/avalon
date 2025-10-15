'use client';

import { useState, useMemo, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import TokenCircle from './TokenCircle';
import { Eye, EyeOff } from 'lucide-react'; 
import CustomButton from '../../../components/core/Buttons/CustomButton';
import { useAuth } from '@/contexts/AuthContext';
import { ConfigContext } from '@/contexts/ConfigContext';
import { useRouter } from 'next/navigation';
import { KycStatusCode, shouldShowKycPrompt } from '@/types/kyc';

export default function Carousel() {
  const [showTotal, setShowTotal] = useState(true); 
  const { user } = useAuth();
  const { texts } = useContext(ConfigContext);
  const router = useRouter();

  const carouselTexts = (texts?.dashboard as any)?.carousel;
  const toggleShowTotal = () => setShowTotal((prev) => !prev); 

  // Lê o código de status KYC do usuário
  const kycCode = useMemo(() => {
    const status = user?.kycStatusCode ?? user?.kycStatus;
    if (typeof status === 'number') return status;
    if (typeof status === 'string') return Number(status) || KycStatusCode.NOT_STARTED;
    return KycStatusCode.NOT_STARTED;
  }, [user]);

  // Verifica se deve mostrar o slide de KYC
  const shouldShowKycSlide = useMemo(() => {
    return shouldShowKycPrompt(kycCode);
  }, [kycCode]);

  // Construir slides dinamicamente
  const slides = useMemo(() => {
    const slideList = [];

    // Slide 1 - Gráfico de tokens (sempre presente)
    slideList.push(
      <div key="token-circle" className="relative flex flex-col items-center justify-center w-full h-full">
        <button
          onClick={toggleShowTotal}
          className="absolute top-4 right-4 focus:outline-none z-10"
        >
          {showTotal ? (
            <Eye className="w-6 h-6 text-gray-600" /> 
          ) : (
            <EyeOff className="w-6 h-6 text-gray-600" /> 
          )}
        </button>
        <TokenCircle show={showTotal} toggleShow={toggleShowTotal} tokens={[]} />
      </div>
    );

    // Slide 2 - KYC (apenas se não estiver aprovado)
    if (shouldShowKycSlide) {
      slideList.push(
        <div key="kyc-prompt" className="h-full w-full flex flex-col items-center justify-center">
          <div className="text-center p-4 sm:p-2 border border-4 rounded-lg shadow-md flex flex-col items-center justify-center w-full max-w-[400px] sm:max-w-[300px] lg:max-w-[690px]">
            <p className="text-base sm:text-lg lg:text-xl p-8">
              {carouselTexts?.message || 'Faça a verificação KYC e desbloqueie todas as funcionalidades da plataforma.'}
            </p>
            <CustomButton
              type="button"
              text={carouselTexts?.button || 'Verificação KYC'}
              className="mt-4 px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-2 ml-auto"
              textColor="#000000"
              borderColor="#08CEFF"
              onClick={() => router.push('/kyc')}
            />
          </div>
        </div>
      );
    }

    // Slide 3 - Conteúdo adicional (apenas se houver conteúdo)
    // Removido por estar vazio - não renderiza nada se não houver conteúdo

    return slideList;
  }, [showTotal, shouldShowKycSlide, router]);

  return (
    <div
      className="
        w-full max-h-[650px] aspect-[4/3] mt-1 mx-auto
        bg-[#fdfcf7] rounded-2xl shadow-md z-0
        lg:absolute lg:right-12 lg:top-1/2 lg:-translate-y-1/2
        lg:w-1/2 lg:h-[115%] lg:aspect-auto lg:max-h-none lg:mt-0 lg:mx-0
        overflow-hidden
        p-2 sm:p-1
      "
      style={{ color: '#404040' }}
    >
      <Swiper
        modules={[Pagination]} 
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="flex items-center justify-center">
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import TokenCircle from './TokenCircle';
import { Eye, EyeOff } from 'lucide-react'; 

export default function Carousel() {
  const [showTotal, setShowTotal] = useState(true); 

  const toggleShowTotal = () => setShowTotal((prev) => !prev); 

  const slides = [
    // Slide 1
    <div className="relative flex flex-col items-center justify-center w-full h-full">
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

      <TokenCircle show={showTotal} toggleShow={toggleShowTotal} />
    </div>,

    // Slide 2
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Novo Slide</h2>
      <p className="text-base">
        Este é o conteúdo do novo slide. Você pode personalizá-lo como quiser.
      </p>
    </div>,

    // Slide 3
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Outro Slide</h2>
      <p className="text-base">
        Este é o conteúdo de outro slide. Você pode personalizá-lo como quiser.
      </p>
    </div>,
  ];

  return (
    <div
      className="
        w-full max-h-[650px] aspect-[4/3] mt-1 mx-auto
        bg-[#fdfcf7] rounded-2xl shadow-md z-10
        lg:absolute lg:right-12 lg:top-1/2 lg:-translate-y-1/2
        lg:w-1/2 lg:h-[140%] lg:aspect-auto lg:max-h-none lg:mt-0 lg:mx-0
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
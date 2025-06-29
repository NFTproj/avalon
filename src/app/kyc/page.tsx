'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/landingPage/Header';
import Footer from '@/components/common/footer';
import KycSteps from './components/KycSteps';
import KycStepStartVerification from './components/KycStepStartVerification';

export default function Kyc() {
  const router = useRouter();

  return (
    <div className="bg-[#f0fcff] min-h-screen flex flex-col">
      <Header />

      {/* tela inicial de verificação */}
      <KycStepStartVerification
       
      />

      {/* se ainda quiser o wizard completo, mantenha abaixo */}
      {/* <KycSteps onFinish={() => router.push('/verificacao-didit')} /> */}

      <Footer />
    </div>
  );
}

interface KycContainerProps {
    children: React.ReactNode
    className?: string
  }
  
  export const KycContainer = ({ children, className = '' }: KycContainerProps) => {
    return (
      <div
        className="flex justify-center items-start w-full bg-[#f0fcff] px-4"
        style={{ paddingTop: '170px', paddingBottom: '200px' }} // ou use classes Tailwind: pt-[80px] pb-[80px]
      >
        <div
          className={`bg-white rounded-xl shadow-md w-full max-w-[560px] p-6 md:p-8 ${className}`}
        >
          {children}
        </div>
      </div>
    )
  }
  
  
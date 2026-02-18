
import React from 'react';
import { ProcessingStep } from '../types';

interface StepIndicatorProps {
  currentStep: ProcessingStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { key: 'fetching', label: 'Tải Metadata Siêu Tốc', description: 'Đang quét dữ liệu đầu vào...' },
    { key: 'transcribing', label: 'Xử Lý Text Lightning', description: 'Chuẩn hóa nội dung kịch bản...' },
    { key: 'analyzing', label: 'Gemini 3 Flash Brain', description: 'Phân đoạn 6s & Tạo Prompt tức thì...' }
  ];

  const getStatus = (stepKey: string) => {
    const stepOrder = ['idle', 'fetching', 'transcribing', 'analyzing', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepKey);

    if (currentIndex > stepIndex || currentStep === 'completed') return 'complete';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-lg mx-auto py-8">
      {steps.map((step, idx) => {
        const status = getStatus(step.key);
        return (
          <div key={step.key} className="flex items-start group">
            <div className="flex flex-col items-center mr-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                status === 'complete' ? 'bg-green-500 border-green-500 text-white' :
                status === 'active' ? 'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                'border-gray-700 text-gray-700'
              }`}>
                {status === 'complete' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{idx + 1}</span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-0.5 h-10 mt-2 transition-colors duration-300 ${status === 'complete' ? 'bg-green-500' : 'bg-gray-800'}`} />
              )}
            </div>
            <div className="pt-0.5">
              <h4 className={`font-semibold transition-colors duration-300 ${
                status === 'active' ? 'text-white' : 
                status === 'complete' ? 'text-green-400' : 'text-gray-500'
              }`}>
                {step.label}
              </h4>
              <p className="text-xs text-gray-500 italic mt-0.5">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;

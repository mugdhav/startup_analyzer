
import React from 'react';

export const BreakdownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-secondary" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5c0-1.141-.448-2.186-1.172-2.929m1.172 2.929c-1.141 0-2.186-.448-2.929-1.172m2.929 1.172A4.5 4.5 0 0115 6m-4.5 4.5V6" />
    </svg>
);
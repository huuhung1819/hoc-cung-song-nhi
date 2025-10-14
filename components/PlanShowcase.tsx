'use client'

import { PlanDisplay, PlanBadge } from './PlanDisplay'

export function PlanShowcase() {
  const plans = ['Gói Cơ Bản', 'Gói Nâng Cao', 'Gói Cao Cấp', 'Premium Package', 'Advanced Plan', 'VIP Plan']

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        🎨 Demo Giao diện Gói Học
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan} className="space-y-4">
            <h3 className="text-sm font-medium text-gray-600 text-center">
              {plan}
            </h3>
            <PlanDisplay plan={plan} />
            <div className="text-center">
              <PlanBadge plan={plan} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>✨ Gradient đẹp cho Gói Cao Cấp</p>
        <p>⭐ Màu xanh cho Gói Nâng Cao</p>
        <p>⚡ Đơn giản cho Gói Cơ Bản</p>
      </div>
    </div>
  )
}

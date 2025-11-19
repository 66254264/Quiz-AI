import { ReactNode } from 'react';
import { useOrientation } from '../../hooks/useOrientation';

interface OrientationAwareProps {
  children: ReactNode;
  portraitContent?: ReactNode;
  landscapeContent?: ReactNode;
  showWarning?: boolean;
}

export const OrientationAware = ({ 
  children, 
  portraitContent, 
  landscapeContent,
  showWarning = false 
}: OrientationAwareProps) => {
  const orientation = useOrientation();

  // If specific content is provided for each orientation
  if (portraitContent && landscapeContent) {
    return orientation === 'portrait' ? <>{portraitContent}</> : <>{landscapeContent}</>;
  }

  // Show warning message for landscape on mobile
  if (showWarning && orientation === 'landscape') {
    return (
      <div className="fixed inset-0 bg-yellow-50 flex items-center justify-center p-4 z-50">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">建议竖屏使用</h3>
          <p className="text-gray-600">为了更好的体验，请将设备旋转至竖屏模式</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

import React, { useState, useEffect } from 'react';
import { Button, notification } from 'antd';
import { AlertOutlined, CloseOutlined } from '@ant-design/icons';

interface SOSNotificationData {
  id: string;
  incident: string;
  reportedBy: string;
  address: string;
  contact: string;
  time: string;
  type: 'emergency' | 'warning';
}

interface SOSNotificationProps {
  sosData: SOSNotificationData;
  onViewSOS: () => void;
  onDismiss: () => void;
}

const SOSNotification: React.FC<SOSNotificationProps> = ({ sosData, onViewSOS, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  const handleViewSOS = () => {
    onViewSOS();
    handleDismiss();
  };

  if (!isVisible) return null;

  const isEmergency = sosData.type === 'emergency';

  return (
    <div 
      className={`fixed top-4 right-4 z-[9999] transform transition-all duration-300 ease-in-out ${
        isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
      style={{ minWidth: '350px', maxWidth: '400px' }}
    >
      <div 
        className={`
          bg-white rounded-lg shadow-2xl border-l-4 
          ${isEmergency ? 'border-red-500' : 'border-yellow-500'}
          overflow-hidden animate-slideInRight
        `}
      >
        {/* Header */}
        <div className={`
          px-4 py-3 text-white flex items-center justify-between
          ${isEmergency ? 'bg-red-500' : 'bg-yellow-500'}
        `}>
          <div className="flex items-center gap-2">
            <AlertOutlined className="text-lg animate-pulse" />
            <span className="font-semibold text-sm">
              {isEmergency ? '🚨 SOS Emergency Alert' : '⚠️ Warning Alert'}
            </span>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <CloseOutlined className="text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Incident:</span>
              <span className="ml-2 text-gray-900">{sosData.incident}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Reported by:</span>
              <span className="ml-2 text-gray-900">{sosData.reportedBy}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Address:</span>
              <span className="ml-2 text-gray-900">{sosData.address}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Contact:</span>
              <span className="ml-2 text-gray-900">{sosData.contact}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Time:</span>
              <span className="ml-2 text-gray-900">{sosData.time}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button 
              type="primary"
              danger={isEmergency}
              className={`flex-1 ${!isEmergency ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500' : ''}`}
              onClick={handleViewSOS}
            >
              View SOS
            </Button>
            <Button 
              type="default"
              onClick={handleDismiss}
              className="flex-1"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SOSNotification; 
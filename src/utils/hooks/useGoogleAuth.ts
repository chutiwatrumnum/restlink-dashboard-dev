import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../stores';
import { getIntendedDestination } from '../googleAuth';

export const useGoogleAuthRedirect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();

  const handlePostAuthSuccess = async () => {
    // เช็คว่ามี intended destination หรือไม่
    const intendedPath = getIntendedDestination();
    console.log('Google OAuth Success: Retrieved intended destination:', intendedPath);
    
    if (intendedPath && intendedPath !== '/auth') {
      // ตรวจสอบ project status ก่อนใช้ intended destination
      const currentStep = await dispatch.setupProject.getStepCondoModel(0);
      console.log('Google OAuth Success: Current project step:', currentStep);
      
      // ถ้า intended path เป็น dashboard แต่ step ไม่ถึง 3 (project ไม่เสร็จ)
      if (intendedPath.includes('/dashboard') && currentStep !== 3) {
        console.log('Intended destination requires completed project, but project not found. Redirecting to appropriate setup page.');
        return false; // ให้ใช้ default logic แทน
      }
      
      // ถ้า intended path เป็น setup-project แต่ step = 3 (project เสร็จแล้ว)
      if (intendedPath.includes('/setup-project') && currentStep === 3) {
        console.log('Intended destination is setup page, but project already completed. Redirecting to dashboard.');
        navigate('/dashboard/profile', { replace: true });
        return true;
      }
      
      // ถ้าผ่านการตรวจสอบแล้ว ใช้ navigate ไปยัง intended destination
      console.log('Google OAuth Success: Navigating to intended destination:', intendedPath);
      navigate(intendedPath, { replace: true });
      return true; // บอกว่าได้ redirect แล้ว
    }
    
    console.log('Google OAuth Success: No valid intended destination, using default logic');
    return false; // ยังไม่ได้ redirect ให้ทำ default logic ต่อ
  };

  return {
    handlePostAuthSuccess
  };
}; 
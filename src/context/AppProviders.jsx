import React from 'react';
import { AlertaProvider } from './AlertaContext';
import { AuthProvider } from './AuthContext';
import { MembershipProvider } from './MembershipContext';
import { RoutineProvider } from './RoutineContext';
import { PosProvider } from './PosContext';
import { EcommerceProvider } from './EcommerceContext';
import { MedicalRecordProvider } from './MedicalRecordContext';
import { CommunicationProvider } from './CommunicationContext';

export const AppProviders = ({ children }) => {
  return (
    <AlertaProvider>
      <AuthProvider>
        <MembershipProvider>
          <RoutineProvider>
            <PosProvider>
              <EcommerceProvider>
                <MedicalRecordProvider>
                  <CommunicationProvider>
                    {children}
                  </CommunicationProvider>
                </MedicalRecordProvider>
              </EcommerceProvider>
            </PosProvider>
          </RoutineProvider>
        </MembershipProvider>
      </AuthProvider>
    </AlertaProvider>
  );
};

export default AppProviders;

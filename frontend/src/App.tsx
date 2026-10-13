import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VoiceListingModal } from './components/VoiceListingModal';
import { PriceEstimatorModal } from './components/PriceEstimatorModal';
import { AssistedRegisterModal } from './components/AssistedRegisterModal';

// Pages
import { HomePage } from './pages/HomePage';
import { BrowseListingsPage } from './pages/BrowseListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { FarmVisitsPage } from './pages/FarmVisitsPage';
import { ModerationPage } from './pages/ModerationPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { Listing } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [browseParams, setBrowseParams] = useState<any>({});

  // Global modals
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [estimatorModalOpen, setEstimatorModalOpen] = useState(false);
  const [assistedModalOpen, setAssistedModalOpen] = useState(false);

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'browse' && params) {
      setBrowseParams(params);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListingId(listing.id);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100 font-sans" style={{ background: '#040d0a' }}>
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenEstimatorModal={() => setEstimatorModalOpen(true)}
        onOpenAssistedModal={() => setAssistedModalOpen(true)}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenVoiceModal={() => setVoiceModalOpen(true)}
            onOpenEstimatorModal={() => setEstimatorModalOpen(true)}
            onOpenAssistedModal={() => setAssistedModalOpen(true)}
            onSelectListing={handleSelectListing}
          />
        )}

        {currentPage === 'browse' && (
          <BrowseListingsPage
            initialSearch={browseParams.search || ''}
            initialCategory={browseParams.category || 'all'}
            onSelectListing={handleSelectListing}
          />
        )}

        {currentPage === 'detail' && selectedListingId && (
          <ListingDetailPage
            listingId={selectedListingId}
            onBack={() => handleNavigate('browse')}
            onNavigateToLogin={() => handleNavigate('login')}
          />
        )}

        {currentPage === 'create-listing' && (
          <CreateListingPage
            onSuccess={(newId) => {
              setSelectedListingId(newId);
              setCurrentPage('detail');
            }}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'visits' && (
          <FarmVisitsPage
            onNavigateToListing={(id) => {
              setSelectedListingId(id);
              setCurrentPage('detail');
            }}
          />
        )}

        {currentPage === 'moderation' && (
          <ModerationPage
            onNavigateToListing={(id) => {
              setSelectedListingId(id);
              setCurrentPage('detail');
            }}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onOpenAssistedModal={() => setAssistedModalOpen(true)}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onSuccess={() => handleNavigate('home')}
            onNavigateToRegister={() => handleNavigate('register')}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onSuccess={() => handleNavigate('home')}
            onNavigateToLogin={() => handleNavigate('login')}
          />
        )}
      </main>

      <Footer />

      {/* Global Modals */}
      <VoiceListingModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onAttributesExtracted={() => {
          handleNavigate('create-listing');
        }}
      />

      <PriceEstimatorModal
        isOpen={estimatorModalOpen}
        onClose={() => setEstimatorModalOpen(false)}
      />

      <AssistedRegisterModal
        isOpen={assistedModalOpen}
        onClose={() => setAssistedModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

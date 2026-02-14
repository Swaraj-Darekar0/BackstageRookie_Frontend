import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="py-12 text-gray-300 relative"> {/* Added relative for button positioning */}
      <div className="max-w-4xl mx-auto space-y-8 glass p-10 rounded-3xl border border-white/10">
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-red-500 transition-colors"
          title="Go Back"
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last Updated: January 30, 2026</p>

        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-red-500">1. Introduction</h2>
            <p>
              Welcome to Backstage Rookie ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this policy carefully.
            </p>

          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-red-500">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Personal Data from Google:</strong> When you log in using your Google account, we access basic profile information, including your name, email address, and profile picture, as permitted by Google.
              </li>
              <li>
                <strong>Google Authentication Tokens:</strong> We securely store your Google OAuth access and refresh tokens in an encrypted server-side session. We use these tokens exclusively to act on your behalf for specific features, such as making calls to the Google Gemini API for analysis and report generation.
              </li>
              <li>
                <strong>User-Provided Data:</strong> We collect the URLs of public GitHub repositories that you submit for analysis, along with any sector hints you provide.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-red-500">3. How We Use Your Information</h2>
            <p>Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we use information collected about you to:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Create and manage your account.</li>
              <li>Provide the core service of analyzing public GitHub repositories.</li>
              <li>Use your Google access token to make requests to the Google Gemini API on your behalf for code analysis and report generation.</li>
              <li>Personalize your user experience, such as displaying your name and profile picture.</li>
              <li>Store analysis results to allow you to generate reports from previous scans.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-red-500">4. Data Storage and Security</h2>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Code Repositories:</strong> Code from the public GitHub repositories you submit is cloned to a temporary, isolated storage location on our server for the duration of the analysis. This data is deleted immediately after the analysis process is complete. We do not store your source code permanently.
              </li>
              <li>
                <strong>Analysis Results:</strong> The JSON results and generated DOCX reports from your scans are stored on our servers to allow you to access them later. We take reasonable measures to protect this data from unauthorized access.
              </li>
              <li>
                <strong>Session Data:</strong> Your authentication tokens and user information are stored in a secure, server-side session and are not directly exposed on the client-side browser.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-red-500">5. Third-Party Services</h2>
            <p>Our service depends on the following third-party services, which have their own privacy policies:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Google:</strong> Used for authentication (OAuth 2.0) and for its Generative AI (Gemini) capabilities. Please review the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Privacy Policy</a>.
              </li>
              <li>
                <strong>GitHub:</strong> Used to access the public source code you provide for analysis. By using our service, you are subject to the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">GitHub Privacy Statement</a>.
              </li>
            </ul>
          </section>

           <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-red-500">6. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at <a href="mailto:darekarheaven@gmail.com" className="text-blue-400 hover:underline">darekarheaven@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

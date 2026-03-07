import { useState, useEffect } from 'react';
import { Lock, Mail, Phone, ShieldCheck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Removed Recaptcha global window definition

const LoginDashboard = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Shared States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Email states
  const [email, setEmail] = useState('');
  const [emailOtpStage, setEmailOtpStage] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('');
  const [timer, setTimer] = useState(60);

  // Phone states
  const [phone, setPhone] = useState('+91');
  const [phoneOtpStage, setPhoneOtpStage] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');

  const navigate = useNavigate();

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if ((emailOtpStage || phoneOtpStage) && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailOtpStage, phoneOtpStage, timer]);

  // --------------- EMAIL OTP LOGIC (SIMULATED) ---------------
  const handleSendEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!email) {
      setErrorMsg("Please enter an email address.");
      return;
    }
    
    setLoading(true);
    try {
      // Simulate EmailJS or SendGrid API call
      // Generates a mock 6-digit OTP
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOtp(mockOtp);
      
      // In a real app, you would dispatch EmailJS here.
      setSuccessMsg(`[SIMULATED EMAILJS] OTP sent to ${email}: ${mockOtp}`);
      
      setEmailOtpStage(true);
      setTimer(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send Email OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (emailOtpInput !== generatedEmailOtp) {
      setErrorMsg("Invalid OTP entered. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const dummyPassword = `EcoWatch#OTP#2024!`;
      
      // Check if user exists by attempting sign-in
      try {
        await signInWithEmailAndPassword(auth, email, dummyPassword);
      } catch (signInErr: any) {
        // If user not found, create new account
        if (signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/user-not-found') {
           const userCredential = await createUserWithEmailAndPassword(auth, email, dummyPassword);
           await setDoc(doc(db, "users", userCredential.user.uid), {
             uid: userCredential.user.uid,
             name: email.split('@')[0], // derived name
             email: email,
             createdAt: serverTimestamp(),
             provider: "email-otp"
           });
        } else {
           throw signInErr;
        }
      }
      
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
         setErrorMsg("Email already registered with a different provider. Please use Google Login or Phone Authentication.");
      } else {
         setErrorMsg(err.message || 'Failed to authenticate via email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------- PHONE OTP LOGIC (SIMULATED FOR FREE TIER) ---------------
  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (phone.length < 10) {
      setErrorMsg("Please enter a valid phone number with country code (e.g. +1234567890).");
      return;
    }

    setLoading(true);

    try {
      // Simulate SMS API call (Twilio/MSG91)
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedPhoneOtp(mockOtp);
      
      setSuccessMsg(`[SIMULATED SMS] OTP sent to ${phone}: ${mockOtp}`);
      setPhoneOtpStage(true);
      setTimer(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send SMS OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (phoneOtpInput !== generatedPhoneOtp) {
      setErrorMsg("Invalid OTP entered. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Create a deterministic dummy email based on phone to link to Firebase Auth
      // Strip ALL non-numeric characters to ensure email format validity: +91 123-456 => 91123456
      const sanitizedPhone = phone.replace(/\D/g, ''); 
      const dummyEmail = `phone_${sanitizedPhone}@ecowatch.local`;
      const dummyPassword = `EcoWatch#Phone#2024!`;
      
      try {
        await signInWithEmailAndPassword(auth, dummyEmail, dummyPassword);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/user-not-found') {
           const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, dummyPassword);
           await setDoc(doc(db, "users", userCredential.user.uid), {
             uid: userCredential.user.uid,
             name: "Mobile User",
             phone: phone,
             createdAt: serverTimestamp(),
             provider: "phone-simulated"
           });
        } else {
           throw signInErr;
        }
      }

      navigate('/');
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      setErrorMsg(`Auth Error: ${err.message || err.code || 'Unknown error during simulated phone auth.'}`);
    } finally {
      setLoading(false);
    }
  };


  // --------------- GOOGLE OAUTH ---------------
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        lastLoginAt: serverTimestamp(),
        provider: "google"
      }, { merge: true });

      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate with Google');
    }
  };

  return (
    <div className="dashboard-container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%' }}>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--accent-primary)', filter: 'blur(80px)', opacity: 0.3, zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-info)', filter: 'blur(80px)', opacity: 0.2, zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
             <ShieldCheck size={32} className="text-accent-primary" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
             Secure Authentication
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
             Verify your identity to access the EcoWatch dashboard.
          </p>
        </div>

        {/* Tab Switcher */}
        {(!emailOtpStage && !phoneOtpStage) && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
            <button 
               onClick={() => setLoginMethod('email')}
               style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: loginMethod === 'email' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: loginMethod === 'email' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <Mail size={16} /> Email OTP
            </button>
            <button 
               onClick={() => setLoginMethod('phone')}
               style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: loginMethod === 'phone' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: loginMethod === 'phone' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <Phone size={16} /> Mobile SMS
            </button>
          </div>
        )}

        {/* Alerts */}
        <div style={{ position: 'relative', zIndex: 1 }}>
           {errorMsg && (
             <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>
               {errorMsg}
             </div>
           )}
           {successMsg && (
             <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: '#10b981', fontSize: '0.875rem', textAlign: 'center' }}>
               {successMsg}
             </div>
           )}
        </div>

        {/* Container for OTP forms */}

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* EMAIL FLOW */}
          {loginMethod === 'email' && (
             <>
               {!emailOtpStage ? (
                 <form onSubmit={handleSendEmailOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email Address</label>
                       <div style={{ position: 'relative' }}>
                          <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email" 
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                            required
                          />
                       </div>
                    </div>
                    <button type="submit" disabled={loading} style={{ marginTop: '0.5rem', width: '100%', padding: '0.875rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                       {loading ? 'Sending Request...' : 'Send Secure OTP'}
                    </button>
                 </form>
               ) : (
                 <form onSubmit={verifyEmailOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Enter 6-Digit Email OTP</label>
                       <div style={{ position: 'relative' }}>
                          <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                          <input 
                            type="text" 
                            maxLength={6}
                            value={emailOtpInput}
                            onChange={(e) => setEmailOtpInput(e.target.value)}
                            placeholder="- - - - - -" 
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', fontSize: '1.25rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                            required
                          />
                       </div>
                    </div>
                    <button type="submit" disabled={loading || emailOtpInput.length !== 6} style={{ marginTop: '0.5rem', width: '100%', padding: '0.875rem', background: 'var(--accent-success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                       {loading ? 'Verifying...' : 'Verify Email Logic'}
                    </button>
                    
                    <button type="button" onClick={handleSendEmailOTP} disabled={timer > 0} style={{ background: 'transparent', border: 'none', color: timer > 0 ? 'var(--text-tertiary)' : 'var(--accent-primary)', fontSize: '0.875rem', marginTop: '0.5rem', cursor: timer > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                       <RefreshCw size={14} /> {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                    </button>
                 </form>
               )}
             </>
          )}

          {/* PHONE FLOW */}
          {loginMethod === 'phone' && (
             <>
               {!phoneOtpStage ? (
                 <form onSubmit={handleSendPhoneOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Mobile Number</label>
                       <div style={{ position: 'relative' }}>
                          <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                          <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 234 567 8900" 
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                            required
                          />
                       </div>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Includes country code. Requires live configuration in Firebase Console.</span>
                    </div>
                    <button type="submit" disabled={loading} id="sign-in-button" style={{ marginTop: '0.5rem', width: '100%', padding: '0.875rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                       {loading ? 'Sending Request...' : 'Send SMS OTP'}
                    </button>
                 </form>
               ) : (
                 <form onSubmit={verifyPhoneOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Enter 6-Digit SMS PIN</label>
                       <div style={{ position: 'relative' }}>
                          <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                          <input 
                            type="text" 
                            maxLength={6}
                            value={phoneOtpInput}
                            onChange={(e) => setPhoneOtpInput(e.target.value)}
                            placeholder="- - - - - -" 
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', fontSize: '1.25rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                            required
                          />
                       </div>
                    </div>
                    <button type="submit" disabled={loading || phoneOtpInput.length !== 6} style={{ marginTop: '0.5rem', width: '100%', padding: '0.875rem', background: 'var(--accent-success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                       {loading ? 'Verifying...' : 'Verify Mobile Entry'}
                    </button>
                    
                    <button type="button" onClick={handleSendPhoneOTP} disabled={timer > 0} style={{ background: 'transparent', border: 'none', color: timer > 0 ? 'var(--text-tertiary)' : 'var(--accent-primary)', fontSize: '0.875rem', marginTop: '0.5rem', cursor: timer > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                       <RefreshCw size={14} /> {timer > 0 ? `Resend SMS in ${timer}s` : 'Resend SMS OTP'}
                    </button>
                 </form>
               )}
             </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
            Or continue with
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button type="button" onClick={handleGoogleLogin} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
               <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
               Google Sign-In
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginDashboard;

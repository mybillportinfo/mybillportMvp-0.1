import { useState, useRef } from "react";
import { ArrowLeft, Camera, Upload, FileText, Zap, Phone, CreditCard, CheckCircle } from "lucide-react";

export default function CameraScan() {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = async () => {
    try {
      setIsScanning(true);
      
      // Access camera and capture image
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Wait for video to load
      video.onloadedmetadata = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        // Stop camera stream
        stream.getTracks().forEach(track => track.stop());
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send to AI scanner
        const response = await fetch('/api/bills/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });
        
        if (response.ok) {
          const result = await response.json();
          setScanResult(result);
        } else {
          const error = await response.json();
          alert('Scanning failed: ' + (error.details || error.error));
        }
        setIsScanning(false);
      };
    } catch (error) {
      console.error('Camera capture error:', error);
      alert('Camera access failed. Please check permissions.');
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsScanning(true);
        
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageData = e.target?.result as string;
          
          try {
            // Send to AI scanner
            const response = await fetch('/api/bills/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: imageData })
            });
            
            if (response.ok) {
              const result = await response.json();
              setScanResult(result);
            } else {
              const error = await response.json();
              alert('Scanning failed: ' + (error.details || error.error));
            }
          } catch (error) {
            console.error('Upload scanning error:', error);
            alert('Failed to process image. Please try again.');
          }
          setIsScanning(false);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('File upload error:', error);
        alert('Failed to read file. Please try again.');
        setIsScanning(false);
      }
    }
  };

  const handleSaveBill = async () => {
    if (scanResult) {
      try {
        // Save bill to database
        const billResponse = await fetch('/api/bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${scanResult.company} Bill`,
            company: scanResult.company,
            amount: scanResult.amount.toString(),
            dueDate: scanResult.dueDate,
            priority: scanResult.amount > 200 ? 'urgent' : scanResult.amount > 100 ? 'medium' : 'low',
            icon: scanResult.type === 'utility' ? 'fas fa-bolt' : 
                  scanResult.type === 'phone' ? 'fas fa-phone' : 
                  scanResult.type === 'credit_card' ? 'fas fa-credit-card' : 'fas fa-file-invoice'
          })
        });

        // Create account from bill scan
        const accountResponse = await fetch('/api/accounts/from-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: scanResult.company,
            accountNumber: scanResult.accountNumber,
            category: scanResult.category,
            type: scanResult.type
          })
        });

        if (billResponse.ok && accountResponse.ok) {
          const accountData = await accountResponse.json();
          alert(`✅ Bill and Account successfully added!\n\n📄 Company: ${scanResult.company}\n💰 Amount: $${scanResult.amount}\n📅 Due Date: ${scanResult.dueDate}\n📱 Account: ${scanResult.accountNumber}\n📋 Category: ${scanResult.category}\n🤖 AI Confidence: ${scanResult.confidence}%\n\n${accountData.message}`);
          window.location.href = "/";
        } else {
          const billError = billResponse.ok ? null : await billResponse.json();
          const accountError = accountResponse.ok ? null : await accountResponse.json();
          alert('Failed to save: ' + (billError?.message || accountError?.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Save bill error:', error);
        alert('Failed to save bill and account. Please try again.');
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "utility": return <Zap className="w-6 h-6 text-yellow-600" />;
      case "phone": return <Phone className="w-6 h-6 text-blue-600" />;
      case "credit_card": return <CreditCard className="w-6 h-6 text-purple-600" />;
      default: return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="p-1 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="MyBillPort Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">**AI Bill Scanner**</h1>
              <p className="text-sm text-gray-600">**Scan bills with your camera**</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {!scanMode && !scanResult && (
          <>
            {/* Scan Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Scan Method</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setScanMode('camera')}
                  className="w-full flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">Use Camera</h4>
                    <p className="text-sm text-gray-600">Take a photo of your bill</p>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">Upload Image</h4>
                    <p className="text-sm text-gray-600">Select from your device</p>
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* AI Features */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">AI-Powered Features</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Automatically extracts bill amount, due date, and company</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Recognizes Canadian utility, phone, and credit card bills</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">95%+ accuracy with machine learning</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Automatically categorizes and adds to dashboard</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Camera View */}
        {scanMode === 'camera' && !isScanning && !scanResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <div className="w-48 h-64 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Camera viewfinder</p>
                  <p className="text-xs text-gray-400 mt-1">Position your bill here</p>
                </div>
              </div>
              
              <button
                onClick={handleCameraCapture}
                className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors mx-auto"
              >
                <Camera className="w-8 h-8" />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setScanMode(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Scanning Animation */}
        {isScanning && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Processing...</h3>
            <p className="text-gray-600 mb-4">Scanning and extracting bill information</p>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div>
            
            <p className="text-sm text-gray-500">This usually takes 2-3 seconds</p>
          </div>
        )}

        {/* Scan Results */}
        {scanResult && (
          <div className="space-y-4">
            {/* Success Header */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Scan Successful!</h3>
                  <p className="text-sm text-green-600">AI Confidence: {scanResult.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Extracted Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Extracted Information</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  {getTypeIcon(scanResult.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{scanResult.company}</h4>
                  <p className="text-sm text-gray-500">{scanResult.category}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Due:</span>
                  <span className="font-semibold text-gray-800">${scanResult.amount} CAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-semibold text-gray-800">{new Date(scanResult.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-semibold text-gray-800">{scanResult.accountNumber}</span>
                </div>
              </div>
            </div>

            {/* Raw Text */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Extracted Text</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {scanResult.extractedText}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleSaveBill}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Bill to Dashboard
              </button>
              
              <button
                onClick={() => {
                  setScanResult(null);
                  setScanMode(null);
                }}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Scan Another Bill
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
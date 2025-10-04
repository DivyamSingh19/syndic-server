// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client"
import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DemoFiatCryptoForms() {
  const [activeTab, setActiveTab] = useState('create');
  
  // Create Transaction State
  const [formData, setFormData] = useState({
    amountINR: '',
    receiverWalletAddress: '',
    tokenType: 'USDC'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  
  // Transaction Status State
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResponse, setStatusResponse] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  // Wallet Balance State
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceResponse, setBalanceResponse] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  
  const startPolling = (transactionId) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v2/demo/getDemoTransactionStatus/${transactionId}`);
        const data = await response.json();
        
        if (data.success) {
          setStatusResponse(data);
          
          // Stop polling if transaction is completed or failed
          if (data.data.status === 'COMPLETED' || data.data.status === 'FAILED') {
            clearInterval(interval);
            setPollingInterval(null);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
  };

  // Create Transaction Handler
  const handleCreateTransaction = async () => {
    if (!formData.amountINR || !formData.receiverWalletAddress) {
      alert('Please fill all fields');
      return;
    }

    setCreateLoading(true);
    setCurrentTransaction(null);
    setStatusResponse(null);
    
    try {
      const response = await fetch('/api/v2/demo/createDemoTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountINR: parseFloat(formData.amountINR),
          receiverWalletAddress: formData.receiverWalletAddress,
          tokenType: formData.tokenType
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        alert(data.message || 'Failed to create transaction');
        setCreateLoading(false);
        return;
      }
      
      setCurrentTransaction(data.data);
      
      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxx',
        amount: data.data.razorpayOrder.amount,
        currency: data.data.razorpayOrder.currency,
        order_id: data.data.razorpayOrder.id,
        name: 'Fiat to Crypto Demo',
        description: `Transfer ${data.data.conversionDetails.amountCrypto} ${formData.tokenType}`,
        handler: async function (razorpayResponse) {
          // Payment successful - verify and execute transfer
          console.log('Payment successful, verifying...');
          
          try {
            const verifyResponse = await fetch('/api/v2/demo/verifyAndExecuteTransfer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature
              })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              // Switch to status tab and start polling
              setActiveTab('status');
              startPolling(data.data.transactionId);
              
              // Fetch initial status
              const statusResp = await fetch(`/api/v2/demo/getDemoTransactionStatus/${data.data.transactionId}`);
              const statusData = await statusResp.json();
              setStatusResponse(statusData);
            } else {
              alert('Payment verified but transfer failed: ' + verifyData.message);
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment successful but verification failed. Please check transaction status manually.');
          }
          
          setCreateLoading(false);
        },
        modal: {
          ondismiss: function() {
            setCreateLoading(false);
            console.log('Payment cancelled');
          }
        },
        theme: { color: '#3b82f6' }
      };
      
      if (window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        alert('Razorpay not loaded. Please refresh the page.');
        setCreateLoading(false);
      }
    } catch (error) {
      alert('Error: ' + error.message);
      setCreateLoading(false);
    }
  };

  // Manual status check
  const handleGetStatus = async (txId) => {
    setStatusLoading(true);
    
    try {
      const response = await fetch(`/api/v2/demo/getDemoTransactionStatus/${txId}`);
      const data = await response.json();
      setStatusResponse(data);
      
      // Start polling if transaction is in progress
      if (data.success && data.data.status !== 'COMPLETED' && data.data.status !== 'FAILED') {
        startPolling(txId);
      }
    } catch (error) {
      setStatusResponse({ success: false, message: error.message });
    } finally {
      setStatusLoading(false);
    }
  };

  // Get Wallet Balance Handler
  const handleGetBalance = async () => {
    setBalanceLoading(true);
    setBalanceResponse(null);
    
    try {
      const response = await fetch('/api/v2/demo/getWalletBalance');
      const data = await response.json();
      setBalanceResponse(data);
    } catch (error) {
      setBalanceResponse({ success: false, message: error.message });
    } finally {
      setBalanceLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="text-green-600" size={20} />;
      case 'FAILED':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Fiat to Crypto Demo</h1>
        <p className="text-gray-600 mb-6">Pay with INR, receive crypto instantly on Solana</p>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['create', 'status', 'balance'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-600'
              }`}
            >
              {tab === 'create' ? 'New Transfer' : tab}
            </button>
          ))}
        </div>

        {/* Create Transaction Form */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Transfer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={formData.amountINR}
                  onChange={(e) => setFormData({...formData, amountINR: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="1000"
                  min="1"
                  max="100000"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum: ₹1,00,000 (Demo limit)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Receiver Wallet Address</label>
                <input
                  type="text"
                  value={formData.receiverWalletAddress}
                  onChange={(e) => setFormData({...formData, receiverWalletAddress: e.target.value})}
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  placeholder="Solana wallet address (32-44 characters)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Token Type</label>
                <select
                  value={formData.tokenType}
                  onChange={(e) => setFormData({...formData, tokenType: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="SOL">SOL (Solana)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="USDT">USDT (Tether)</option>
                </select>
              </div>

              {formData.amountINR && (
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Platform Fee (2%):</span> ₹{(parseFloat(formData.amountINR) * 0.02).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Total to Pay:</span> ₹{(parseFloat(formData.amountINR) * 1.02).toFixed(2)}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCreateTransaction}
                disabled={createLoading}
                className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {createLoading && <Loader2 className="animate-spin" size={20} />}
                {createLoading ? 'Opening Payment...' : 'Continue to Payment'}
              </button>

              <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
                <p className="font-medium mb-2">How it works:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Fill in the details and click Continue</li>
                  <li>Complete payment via Razorpay</li>
                  <li>Crypto is automatically transferred to the receiver wallet</li>
                  <li>Check status in the Status tab</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {activeTab === 'status' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Transaction Status</h2>
            
            {currentTransaction && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Current Transaction ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentTransaction.transactionId}
                    readOnly
                    className="flex-1 border rounded px-3 py-2 font-mono text-sm bg-gray-50"
                  />
                  <button
                    onClick={() => handleGetStatus(currentTransaction.transactionId)}
                    disabled={statusLoading}
                    className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {pollingInterval && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-600" size={16} />
                <span className="text-sm text-blue-800">Auto-refreshing status...</span>
              </div>
            )}
            
            {statusResponse && statusResponse.success && (
              <div className="space-y-4">
                {/* Status Header */}
                <div className={`p-4 rounded border ${getStatusColor(statusResponse.data.status)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(statusResponse.data.status)}
                    <span className="font-semibold text-lg">{statusResponse.data.status}</span>
                  </div>
                  {statusResponse.data.status === 'COMPLETED' && (
                    <p className="text-sm">Transfer completed successfully!</p>
                  )}
                  {statusResponse.data.status === 'FAILED' && (
                    <p className="text-sm">Transfer failed. Please contact support.</p>
                  )}
                </div>

                {/* Transfer Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
                    <p className="text-lg font-semibold">₹{statusResponse.data.payment.amountINR}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-500 mb-1">Crypto Transferred</p>
                    <p className="text-lg font-semibold">
                      {statusResponse.data.transfer.amount} {statusResponse.data.transfer.token}
                    </p>
                  </div>
                </div>

                {/* Receiver Wallet */}
                <div className="border rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Receiver Wallet</p>
                  <p className="font-mono text-sm break-all">{statusResponse.data.transfer.receiverWallet}</p>
                </div>

                {/* Blockchain Link */}
                {statusResponse.data.transfer.explorerUrl && (
                  <a
                    href={statusResponse.data.transfer.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700"
                  >
                    View on Solscan <ExternalLink size={16} />
                  </a>
                )}

                {/* Timeline */}
                <div className="border rounded p-4">
                  <p className="font-medium mb-3">Transaction Timeline</p>
                  <div className="space-y-3">
                    {statusResponse.data.timeline.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`mt-1 ${step.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-400'}`}>
                          {getStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{step.step.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500">{step.provider}</p>
                          {step.completedAt && (
                            <p className="text-xs text-gray-400">
                              {new Date(step.completedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw Response */}
                <details className="border rounded">
                  <summary className="p-3 cursor-pointer font-medium text-sm">View Raw Data</summary>
                  <pre className="p-3 text-xs overflow-auto bg-gray-50 border-t">
                    {JSON.stringify(statusResponse.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {statusResponse && !statusResponse.success && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                {statusResponse.message || 'Failed to fetch transaction status'}
              </div>
            )}

            {!statusResponse && !currentTransaction && (
              <div className="text-center py-8 text-gray-500">
                <p>No transaction selected</p>
                <p className="text-sm mt-2">Create a new transfer to see status here</p>
              </div>
            )}
          </div>
        )}

        {/* Wallet Balance */}
        {activeTab === 'balance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Wallet Balance</h2>
            
            <button
              onClick={handleGetBalance}
              disabled={balanceLoading}
              className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 mb-4"
            >
              {balanceLoading && <Loader2 className="animate-spin" size={20} />}
              {balanceLoading ? 'Fetching...' : 'Get Wallet Balance'}
            </button>
            
            {balanceResponse && balanceResponse.success && (
              <div className="space-y-4">
                <div className="border rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                  <p className="font-mono text-sm break-all">{balanceResponse.data.walletAddress}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{balanceResponse.data.balances.SOL}</p>
                    <p className="text-sm text-gray-600 mt-1">SOL</p>
                  </div>
                  <div className="border rounded p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{balanceResponse.data.balances.USDC}</p>
                    <p className="text-sm text-gray-600 mt-1">USDC</p>
                  </div>
                  <div className="border rounded p-4 text-center">
                    <p className="text-3xl font-bold text-teal-600">{balanceResponse.data.balances.USDT}</p>
                    <p className="text-sm text-gray-600 mt-1">USDT</p>
                  </div>
                </div>

                <details className="border rounded">
                  <summary className="p-3 cursor-pointer font-medium text-sm">View Raw Data</summary>
                  <pre className="p-3 text-xs overflow-auto bg-gray-50 border-t">
                    {JSON.stringify(balanceResponse, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {balanceResponse && !balanceResponse.success && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                {balanceResponse.message || 'Failed to fetch wallet balance'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
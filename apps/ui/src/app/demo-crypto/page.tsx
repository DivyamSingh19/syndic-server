/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client"
import React, {useEffect, useState} from 'react';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  getAccount,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Default export React component — single-file example you can drop into a create-react-app / Vite project
export default function CryptoTransfer() {
  const [provider, setProvider] = useState(null);
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('devnet'); 
  const [status, setStatus] = useState('');
  const [isTokenTransfer, setIsTokenTransfer] = useState(false);
  const [tokenMint, setTokenMint] = useState('');

  useEffect(() => {
    // detect phantom
    if (window.solana && window.solana.isPhantom) {
      setProvider(window.solana);
     
      window.solana.on('connect', () => {
        setConnected(true);
        setPublicKey(window.solana.publicKey.toString());
      });
      window.solana.on('disconnect', () => {
        setConnected(false);
        setPublicKey(null);
      });
    } else {
      setStatus('Phantom not found. Install Phantom extension wallet.');
    }

    return () => {
      if (window.solana && window.solana.isPhantom) {
        try { window.solana.removeAllListeners('connect'); window.solana.removeAllListeners('disconnect'); } catch(e){}
      }
    };
  }, []);

  const connect = async () => {
    try {
      const resp = await provider.connect(); // phantom popup
      setConnected(true);
      setPublicKey(resp.publicKey.toString());
      setStatus('Connected: ' + resp.publicKey.toString());
    } catch (err) {
      console.error(err);
      setStatus('Connection rejected');
    }
  };

  const disconnect = async () => {
    try {
      await provider.disconnect();
      setConnected(false);
      setPublicKey(null);
      setStatus('Disconnected');
    } catch (err) {
      console.error(err);
      setStatus('Disconnect failed');
    }
  };

  // SOL transfer
  const sendSol = async (connection, fromPubkey, toPubkey, solAmount) => {
    const lamports = Math.round(parseFloat(solAmount) * LAMPORTS_PER_SOL);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(fromPubkey),
        toPubkey: new PublicKey(toPubkey),
        lamports,
      })
    );

    tx.feePayer = new PublicKey(fromPubkey);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Phantom will show popup to sign
    const signed = await provider.signTransaction(tx);
    const raw = signed.serialize();
    const sig = await connection.sendRawTransaction(raw);
    await connection.confirmTransaction(sig);
    return sig;
  };

  // SPL token transfer (uses transferChecked so decimals are enforced)
  const sendSplToken = async (connection, fromPubkey, toPubkey, mintAddress, tokenAmount) => {
    const mintPubkey = new PublicKey(mintAddress);
    // resolve associated token accounts
    const fromAta = await getAssociatedTokenAddress(mintPubkey, new PublicKey(fromPubkey));
    const toAta = await getAssociatedTokenAddress(mintPubkey, new PublicKey(toPubkey));

    // fetch mint to know decimals
    const mintInfo = await getMint(connection, mintPubkey);
    const decimals = mintInfo.decimals;
    const amountInSmallest = BigInt(Math.round(parseFloat(tokenAmount) * (10 ** decimals)));

    // ensure destination ATA exists — this code assumes it exists; if not you must create it (omitted for brevity)

    const ix = createTransferCheckedInstruction(
      fromAta,
      mintPubkey,
      toAta,
      new PublicKey(fromPubkey),
      amountInSmallest,
      decimals,
      [/* signers if multisig */]
    );

    const tx = new Transaction().add(ix);
    tx.feePayer = new PublicKey(fromPubkey);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await provider.signTransaction(tx);
    const raw = signed.serialize();
    const sig = await connection.sendRawTransaction(raw);
    await connection.confirmTransaction(sig);
    return sig;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Preparing transaction...');

    if (!provider || !connected) {
      setStatus('Please connect Phantom first.');
      return;
    }
    try {
      const conn = new Connection(clusterApiUrl(network), 'confirmed');
      const from = provider.publicKey.toString();
      const to = receiver;

      if (!PublicKey.isOnCurve(new PublicKey(to))) {
        setStatus('Receiver address invalid');
        return;
      }

      let sig;
      if (isTokenTransfer) {
        if (!tokenMint) { setStatus('Enter token mint for SPL token transfer'); return; }
        setStatus('Requesting Phantom approval (SPL token transfer)...');
        sig = await sendSplToken(conn, from, to, tokenMint, amount);
      } else {
        setStatus('Requesting Phantom approval (SOL transfer)...');
        sig = await sendSol(conn, from, to, amount);
      }

      setStatus('Transaction sent: ' + sig);
    } catch (err) {
      console.error(err);
      setStatus('Transaction failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Phantom Crypto → Crypto Transfer</h2>

      <div className="mb-4">
        {connected ? (
          <div>
            <div>Connected as <code>{publicKey}</code></div>
            <button className="mt-2 p-2 rounded shadow bg-gray-100" onClick={disconnect}>Disconnect</button>
          </div>
        ) : (
          <div>
            <button className="p-2 rounded shadow bg-indigo-600 text-white" onClick={connect}>Connect Phantom</button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Network</label>
          <select value={network} onChange={e => setNetwork(e.target.value)} className="p-2 rounded border">
            <option value="devnet">Devnet</option>
            <option value="testnet">Testnet</option>
            <option value="mainnet-beta">Mainnet Beta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">Receiver wallet</label>
          <input required value={receiver} onChange={e => setReceiver(e.target.value)} className="w-full p-2 border rounded" placeholder="Enter receiver public key" />
        </div>

        <div>
          <label className="block text-sm">Amount</label>
          <input required value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded" placeholder="Amount (SOL or token units)" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" checked={isTokenTransfer} onChange={e => setIsTokenTransfer(e.target.checked)} id="token" />
          <label htmlFor="token">SPL token transfer</label>
        </div>

        {isTokenTransfer && (
          <div>
            <label className="block text-sm">Token mint (SPL)</label>
            <input value={tokenMint} onChange={e => setTokenMint(e.target.value)} className="w-full p-2 border rounded" placeholder="Token mint public key" />
            <p className="text-xs text-gray-500 mt-1">This example assumes the destination ATA exists. In production: create ATA for destination if missing.</p>
          </div>
        )}

        <div>
          <button type="submit" className="p-2 rounded bg-green-600 text-white">Send</button>
        </div>
      </form>

      <div className="mt-4 p-2 bg-gray-50 rounded">
        <strong>Status:</strong>
        <div>{status}</div>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>Notes:</p>
        <ul className="list-disc ml-5">
          <li>Install Phantom and unlock it before connecting.</li>
          <li>For SPL tokens you may need to create the receiver&apos;s associated token account (ATA) if it doesn&apos;t exist.</li>
          <li>In production set network to mainnet-beta and handle edge cases, retries, better UI, and security reviews.</li>
        </ul>
      </div>
    </div>
  );
}

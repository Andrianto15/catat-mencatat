'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Person, GoldPurchase } from '@/lib/gold/actions';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  initialData?: GoldPurchase | null;
  onSave: (data: Omit<GoldPurchase, 'id'>, keepOpen?: boolean) => Promise<void>;
}

export function PurchaseModal({
  isOpen,
  onClose,
  people,
  initialData,
  onSave,
}: PurchaseModalProps) {
  const [personId, setPersonId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [brand, setBrand] = useState('ANTAM');
  const [weightGram, setWeightGram] = useState<number | ''>(1);
  const [pieceCount, setPieceCount] = useState<number | ''>(1);
  const [pricePerPiece, setPricePerPiece] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setPersonId(initialData.person_id);
      setPurchaseDate(initialData.purchase_date);
      setBrand(initialData.brand);
      setWeightGram(initialData.weight_gram);
      setPieceCount(initialData.piece_count);
      setPricePerPiece(initialData.price_per_piece);
      setNotes(initialData.notes || '');
    } else {
      if (people.length > 0 && !personId) {
        setPersonId(people[0].id);
      }
    }
  }, [initialData, people]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (keepOpen = false) => {
    if (!personId) {
      setError('Pilih pemilik emas.');
      return;
    }
    if (!purchaseDate) {
      setError('Tanggal beli wajib diisi.');
      return;
    }
    if (!weightGram || Number(weightGram) <= 0) {
      setError('Gramasi emas harus lebih dari 0.');
      return;
    }
    if (!pieceCount || Number(pieceCount) <= 0) {
      setError('Jumlah keping minimal 1.');
      return;
    }
    if (pricePerPiece === '' || Number(pricePerPiece) <= 0) {
      setError('Harga per keping harus lebih dari 0.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave(
        {
          person_id: personId,
          purchase_date: purchaseDate,
          brand,
          weight_gram: Number(weightGram),
          piece_count: Number(pieceCount),
          price_per_piece: Number(pricePerPiece),
          notes: notes.trim() || null,
        },
        keepOpen
      );

      if (keepOpen) {
        // Sticky fields: keep personId, purchaseDate, brand. Clear specific price/weight.
        setPricePerPiece('');
        setNotes('');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--bg-card)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))',
          border: '1px solid var(--border-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 id="purchase-modal-title" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {initialData ? 'Ubah Pembelian Emas' : 'Tambah Pembelian Emas'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            title="Tutup"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.5rem',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.625rem',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label
              htmlFor="gold-person"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Pemilik Emas
            </label>
            <select
              id="gold-person"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
              }}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id} style={{ color: '#000' }}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label
                htmlFor="gold-date"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Tanggal Beli
              </label>
              <input
                id="gold-date"
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label
                htmlFor="gold-brand"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Merk / Brand
              </label>
              <select
                id="gold-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="ANTAM" style={{ color: '#000' }}>ANTAM</option>
                <option value="UBS" style={{ color: '#000' }}>UBS</option>
                <option value="GALERI 24" style={{ color: '#000' }}>GALERI 24</option>
                <option value="LOTUS ARCHI" style={{ color: '#000' }}>LOTUS ARCHI</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label
                htmlFor="gold-weight"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Gramasi (gr)
              </label>
              <input
                id="gold-weight"
                type="number"
                step="0.01"
                placeholder="1"
                value={weightGram}
                onChange={(e) => setWeightGram(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label
                htmlFor="gold-pieces"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
              >
                Jumlah Keping (pcs)
              </label>
              <input
                id="gold-pieces"
                type="number"
                placeholder="1"
                value={pieceCount}
                onChange={(e) => setPieceCount(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="gold-price"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Harga Beli per Keping (Rp)
            </label>
            <input
              id="gold-price"
              type="number"
              placeholder="1450000"
              value={pricePerPiece}
              onChange={(e) => setPricePerPiece(e.target.value === '' ? '' : Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="gold-notes"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Catatan (Opsional)
            </label>
            <textarea
              id="gold-notes"
              rows={2}
              placeholder="Beli di Butik LM Pulo Gadung, nomor seri..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {!initialData && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-primary)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Simpan & Tambah Lagi
              </button>
            )}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              {submitting ? 'Menyimpan...' : 'Simpan & Selesai'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

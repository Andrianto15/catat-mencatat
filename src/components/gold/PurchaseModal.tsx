'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Person, GoldPurchase } from '@/lib/gold/actions';
import { NumberInput } from '@/components/NumberInput';

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
  const [buybackPricePerPiece, setBuybackPricePerPiece] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isBackdropClickRef = React.useRef(false);

  useEffect(() => {
    if (initialData) {
      setPersonId(initialData.person_id);
      setPurchaseDate(initialData.purchase_date);
      setBrand(initialData.brand);
      setWeightGram(initialData.weight_gram);
      setPieceCount(initialData.piece_count);
      setPricePerPiece(initialData.price_per_piece);
      setBuybackPricePerPiece(
        initialData.buyback_price_per_piece !== null && initialData.buyback_price_per_piece !== undefined
          ? initialData.buyback_price_per_piece
          : ''
      );
      setNotes(initialData.notes || '');
    } else {
      setBuybackPricePerPiece('');
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
    if (buybackPricePerPiece !== '' && Number(buybackPricePerPiece) < 0) {
      setError('Harga buyback tidak boleh negatif.');
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
          buyback_price_per_piece: buybackPricePerPiece !== '' ? Number(buybackPricePerPiece) : null,
          notes: notes.trim() || null,
        },
        keepOpen
      );

      if (keepOpen) {
        // Sticky fields: keep personId, purchaseDate, brand. Clear specific price/weight.
        setPricePerPiece('');
        setBuybackPricePerPiece('');
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
      className="modal-overlay"
      onMouseDown={(e) => {
        isBackdropClickRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (isBackdropClickRef.current && e.target === e.currentTarget) {
          onClose();
        }
        isBackdropClickRef.current = false;
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
        className="modal-content"
        style={{ maxWidth: '540px' }}
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
              className="form-select"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
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
                className="form-select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="ANTAM" style={{ color: '#000' }}>ANTAM</option>
                <option value="UBS" style={{ color: '#000' }}>UBS</option>
                <option value="GALERI 24" style={{ color: '#000' }}>GALERI 24</option>
                <option value="LOTUS ARCHI" style={{ color: '#000' }}>LOTUS ARCHI</option>
                <option value="ANTAM RETRO" style={{ color: '#000' }}>ANTAM RETRO</option>
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
              <NumberInput
                id="gold-weight"
                allowDecimal
                placeholder="1"
                value={weightGram}
                onChange={setWeightGram}
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
              <NumberInput
                id="gold-pieces"
                placeholder="1"
                value={pieceCount}
                onChange={setPieceCount}
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
            <NumberInput
              id="gold-price"
              placeholder="1450000"
              value={pricePerPiece}
              onChange={setPricePerPiece}
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
              htmlFor="gold-buyback-price"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}
            >
              Harga Jual / Buyback saat Beli per Keping (Rp) (Opsional)
            </label>
            <NumberInput
              id="gold-buyback-price"
              placeholder="1320000"
              value={buybackPricePerPiece}
              onChange={setBuybackPricePerPiece}
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
              className="form-textarea"
              rows={2}
              placeholder="Beli di Butik LM Pulo Gadung, nomor seri..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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

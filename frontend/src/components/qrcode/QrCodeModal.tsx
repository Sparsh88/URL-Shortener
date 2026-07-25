import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { UrlItem } from '../../types';
import { useToast } from '../common/Toast';
import { Download, Copy, QrCode, Palette } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: UrlItem | null;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, url }) => {
  const [fgColor, setFgColor] = useState('#6366F1');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const canvasRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  if (!url) return null;

  const fullShortUrl = `${import.meta.env.VITE_SHORT_BASE_URL || 'http://localhost:5000/r'}/${url.customAlias || url.shortCode}`;

  const downloadPNG = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `linkforge-qr-${url.shortCode}.png`;
    link.click();
    showToast('Downloaded QR Code as PNG', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Generator" maxWidth="md">
      <div className="space-y-6 text-center">
        {/* Short link info */}
        <div>
          <h4 className="text-base font-bold text-white truncate">{url.title || url.shortCode}</h4>
          <p className="text-xs text-brand-400 font-mono mt-0.5">{fullShortUrl}</p>
        </div>

        {/* QR Code Canvas Preview */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 inline-block shadow-2xl">
          <div ref={canvasRef} className="p-4 rounded-xl bg-white inline-block">
            <QRCodeCanvas
              value={fullShortUrl}
              size={200}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Color Customizer */}
        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-center space-x-1.5">
            <Palette className="w-4 h-4 text-brand-400" />
            <span>Customize QR Colors</span>
          </h5>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Foreground Color</label>
              <div className="flex items-center space-x-2 justify-center">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-300">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Background Color</label>
              <div className="flex items-center space-x-2 justify-center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-300">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Actions */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={downloadPNG}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center space-x-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

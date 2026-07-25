import React, { useRef } from 'react';
import { Modal } from '../common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { UrlItem } from '../../types';
import { useToast } from '../common/Toast';
import { Download, Copy, ExternalLink, QrCode } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: UrlItem;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, url }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { showToast } = useToast();

  const shortCode = url.customAlias || url.shortCode;
  const fullUrl = `${import.meta.env.VITE_SHORT_BASE_URL || 'http://localhost:5000/r'}/${shortCode}`;

  const handleDownloadPng = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 1000, 1000);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qr-${shortCode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showToast('Downloaded PNG QR Code', 'success');
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom QR Code" maxWidth="md">
      <div className="space-y-6 text-center">
        {/* QR Code Container */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center inline-block mx-auto shadow-inner">
          <QRCodeSVG
            ref={svgRef}
            value={fullUrl}
            size={220}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#09090b"
          />
        </div>

        {/* Short Link Target Details */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">QR Code Target Link:</p>
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center space-x-1"
          >
            <span>{fullUrl}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={handleDownloadPng}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

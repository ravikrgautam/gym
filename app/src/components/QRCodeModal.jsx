import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

const QRCodeModal = ({ member, onClose }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const qrRef = useRef(null);

    useEffect(() => {
        if (!member) return;

        const fetchToken = async () => {
            try {
                const res = await apiFetch(`/api/members/${member.id}/qr`);
                if (res.token) {
                    setToken(res.token);
                } else {
                    setError('Failed to generate QR Code');
                }
            } catch (err) {
                console.error('Error fetching QR token:', err);
                setError('Error fetching QR token');
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, [member]);

    const handleDownload = () => {
        if (!qrRef.current) return;

        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width + 40; // Add padding
            canvas.height = img.height + 40;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 20, 20);

            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `${member.name.replace(/\s+/g, '_')}_QRCode.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handlePrint = () => {
        if (!qrRef.current) return;

        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR Code - ${member.name}</title>
                    <style>
                        body { text-align: center; font-family: sans-serif; padding-top: 50px; }
                        .card { border: 1px solid #ccc; padding: 30px; display: inline-block; border-radius: 10px; }
                        h2 { margin: 0 0 10px 0; color: #333; }
                        p { margin: 0 0 20px 0; color: #666; }
                        @media print {
                            @page { margin: 0; }
                            body { padding: 50px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>Gym Access Card</h2>
                        <p>${member.name}</p>
                        ${svg.outerHTML}
                    </div>
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!member) return null;

    return (
        <>
            <div className="modal-backdrop fade show overlay"></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0 d-flex justify-content-between">
                            <h5 className="fw-bold mb-0">Member QR Code</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4 text-center">
                            <h4 className="fw-bold text-dark mb-1">{member.name}</h4>
                            <p className="text-muted small mb-4">Scan this code at the reception to check-in.</p>

                            <div className="d-flex justify-content-center align-items-center mb-4 min-ph-250">
                                {loading ? (
                                    <div className="text-center text-primary py-5">
                                        <Loader2 size={40} className="spin mb-2 mx-auto" />
                                        <p className="small mb-0">Generating secure QR code...</p>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger mb-0 w-100">{error}</div>
                                ) : token ? (
                                    <div ref={qrRef} className="p-3 bg-white shadow-sm border rounded-4 d-inline-block">
                                        <QRCodeSVG value={token} size={256} level="H" includeMargin={true} />
                                    </div>
                                ) : null}
                            </div>

                            <div className="d-flex justify-content-center gap-3">
                                <button
                                    className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2"
                                    onClick={handleDownload}
                                    disabled={loading || !token}
                                >
                                    <Download size={18} /> Download
                                </button>
                                <button
                                    className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                                    onClick={handlePrint}
                                    disabled={loading || !token}
                                >
                                    <Printer size={18} /> Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default QRCodeModal;

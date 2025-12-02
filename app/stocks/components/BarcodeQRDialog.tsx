"use client";

/**
 * Barcode & QR Code Dialog Component
 * Generates and displays barcode and QR code for products
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types";
import QRCode from "qrcode";
import { Download } from "lucide-react";

interface BarcodeQRDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

export function BarcodeQRDialog({ open, onClose, product }: BarcodeQRDialogProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (open && product) {
      generateQRCode();
    }
  }, [open, product]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Generate QR code with product information
      const qrData = JSON.stringify({
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.sellingPrice,
      });

      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.download = `${product.sku}-qr-code.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const generateBarcode = () => {
    // Simple barcode representation using product SKU
    // In a real application, you'd use a barcode library like jsbarcode
    return product.sku.padEnd(13, "0").substring(0, 13);
  };

  const barcode = generateBarcode();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Barcode & QR Code - {product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Product SKU</div>
            <div className="text-xl font-bold font-mono">{product.sku}</div>
          </div>

          {/* QR Code */}
          <div className="space-y-4">
            <h3 className="font-semibold">QR Code</h3>
            <div className="flex flex-col items-center space-y-4">
              {isGenerating ? (
                <div className="w-64 h-64 flex items-center justify-center border rounded-lg">
                  <div className="text-muted-foreground">Generating QR Code...</div>
                </div>
              ) : qrCodeDataUrl ? (
                <>
                  <img src={qrCodeDataUrl} alt="QR Code" className="border rounded-lg" />
                  <Button onClick={downloadQRCode} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {/* Barcode */}
          <div className="space-y-4">
            <h3 className="font-semibold">Barcode</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white border-2 border-black rounded-lg">
                <div className="font-mono text-2xl font-bold tracking-widest">
                  {barcode}
                </div>
                <div className="text-center text-sm mt-2">{product.sku}</div>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Note: This is a text representation. For actual barcode generation,
                consider using a barcode library or backend service.
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certDir = path.resolve(__dirname, '../../certs');

export interface CertificateInfo {
  cert: string;
  key: string;
  fingerprint: string;
}

export class CertificateManager {
  private static instance: CertificateManager;
  private certInfo: CertificateInfo | null = null;

  public static getInstance(): CertificateManager {
    if (!CertificateManager.instance) {
      CertificateManager.instance = new CertificateManager();
    }
    return CertificateManager.instance;
  }

  public async getOrCreateCertificate(): Promise<CertificateInfo> {
    if (this.certInfo) {
      return this.certInfo;
    }

    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const certPath = path.join(certDir, 'localhost.crt');
    const keyPath = path.join(certDir, 'localhost.key');

    // If certs already exist on disk, load them
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const cert = fs.readFileSync(certPath, 'utf8');
      const key = fs.readFileSync(keyPath, 'utf8');
      // Validate they are real PEM certificates, not broken stubs
      if (cert.startsWith('-----BEGIN CERTIFICATE-----') && key.startsWith('-----BEGIN')) {
        const fingerprint = crypto.createHash('sha256').update(cert).digest('hex');
        this.certInfo = { cert, key, fingerprint };
        return this.certInfo;
      }
    }

    // Generate real self-signed X.509 certificate with SANs using selfsigned (async)
    const selfsigned: any = await import('selfsigned');
    const generateFn = selfsigned.generate || selfsigned.default?.generate;
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = await generateFn(attrs, {
      days: 365,
      keySize: 2048,
      algorithm: 'sha256',
      extensions: [
        {
          name: 'subjectAltName',
          altNames: [
            { type: 2, value: 'localhost' },
            { type: 7, ip: '127.0.0.1' },
          ],
        },
      ],
    });

    const cert = pems.cert;
    const key = pems.private;
    const fingerprint = pems.fingerprint || crypto.createHash('sha256').update(cert).digest('hex');

    fs.writeFileSync(certPath, cert, 'utf8');
    fs.writeFileSync(keyPath, key, 'utf8');

    this.certInfo = { cert, key, fingerprint };
    console.error(`[TLS] Self-signed certificate generated and saved to ${certDir}`);
    return this.certInfo;
  }

  public getFingerprint(): string {
    if (this.certInfo) {
      return this.certInfo.fingerprint;
    }
    return 'not-yet-initialized';
  }
}

export const certificateManager = CertificateManager.getInstance();

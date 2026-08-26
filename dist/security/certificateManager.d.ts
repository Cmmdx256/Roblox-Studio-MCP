export interface CertificateInfo {
    cert: string;
    key: string;
    fingerprint: string;
}
export declare class CertificateManager {
    private static instance;
    private certInfo;
    static getInstance(): CertificateManager;
    getOrCreateCertificate(): Promise<CertificateInfo>;
    getFingerprint(): string;
}
export declare const certificateManager: CertificateManager;
//# sourceMappingURL=certificateManager.d.ts.map
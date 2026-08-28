import { VerificationReport } from '../verification/VerificationEngine.js';
import { ConditionSpec } from '../capabilities/CapabilityContract.js';
export type TransactionState = 'CREATED' | 'RUNNING' | 'VERIFYING' | 'COMMITTED' | 'FAILED' | 'ROLLING_BACK' | 'ROLLED_BACK' | 'PARTIALLY_ROLLED_BACK';
export interface TransactionStep {
    stepId: string;
    action: string;
    params: Record<string, any>;
    inverseAction?: string;
    inverseParams?: Record<string, any>;
    status: 'PENDING' | 'EXECUTED' | 'VERIFIED' | 'FAILED' | 'ROLLED_BACK';
    result?: any;
    verification?: VerificationReport;
    timestamp: number;
}
export interface Transaction {
    id: string;
    name: string;
    description?: string;
    state: TransactionState;
    recordingId?: string;
    steps: TransactionStep[];
    createdAt: number;
    completedAt?: number;
    error?: string;
    /** Machine-readable manifest; pre/post hashes are populated only from real snapshots. */
    manifest: {
        operationList: string[];
        rollbackActions: string[];
        affectedInstances: string[];
        affectedScripts: string[];
        verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'FAILED' | 'BLOCKED';
    };
}
export declare class TransactionEngine {
    private transactions;
    /**
     * Begins a new transaction and registers an undo waypoint/recording in Studio.
     */
    beginTransaction(name: string, description?: string): Promise<Transaction>;
    /**
     * Executes a step within a transaction with optional verification and inverse action recording.
     */
    executeStep(transactionId: string, action: string, params: Record<string, any>, options?: {
        preconditions?: ConditionSpec[];
        postconditions?: ConditionSpec[];
        inverseAction?: string;
        inverseParams?: Record<string, any>;
    }): Promise<{
        success: boolean;
        result: any;
        verification?: VerificationReport;
        error?: string;
    }>;
    /**
     * Commits the transaction and locks in the Studio ChangeHistoryService recording.
     */
    commitTransaction(transactionId: string): Promise<{
        success: boolean;
        transaction: Transaction;
    }>;
    /**
     * Rolls back all executed steps in reverse order or cancels ChangeHistory recording.
     */
    rollbackTransaction(transactionId: string, reason?: string): Promise<{
        success: boolean;
        rolledBackStepsCount: number;
    }>;
    getTransaction(id: string): Transaction | undefined;
}
export declare const transactionEngine: TransactionEngine;
//# sourceMappingURL=TransactionEngine.d.ts.map
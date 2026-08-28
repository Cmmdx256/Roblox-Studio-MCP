export interface RegressionTestCase {
    id: string;
    system: string;
    name: string;
    targetPath?: string;
    checkFn?: () => boolean | Promise<boolean>;
}
export interface RegressionReport {
    timestamp: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    hasRegressions: boolean;
    affectedSystems: string[];
    details: Array<{
        id: string;
        system: string;
        name: string;
        passed: boolean;
        evidence?: string;
    }>;
}
export declare class RegressionEngine {
    private testSuite;
    constructor();
    private registerDefaultTests;
    registerTest(test: RegressionTestCase): void;
    /**
     * Determines targeted regression tests based on modified system or node in the Knowledge Graph.
     */
    getTargetedTests(modifiedNodeId?: string): RegressionTestCase[];
    /**
     * Runs targeted or full regression test suite.
     */
    runRegressionSuite(modifiedNodeId?: string): Promise<RegressionReport>;
}
export declare const regressionEngine: RegressionEngine;
//# sourceMappingURL=RegressionEngine.d.ts.map
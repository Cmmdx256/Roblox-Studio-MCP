# Dual HTTP / HTTPS Transport Architecture

## Overview
The Universal Roblox Studio AI MCP daemon hosts both standard HTTP and cryptographically valid HTTPS endpoints concurrently:

* **HTTP Bridge**: `http://127.0.0.1:38883`
* **HTTPS Bridge**: `https://127.0.0.1:38884`

---

## Certificate Generation & Trust
* Real X.509 2048-bit RSA self-signed certificates are generated on first launch using `selfsigned`.
* Includes Subject Alternative Names (SANs) for `localhost`, `127.0.0.1`, and `::1`.
* Cryptographic certificates and keys are securely stored in `./certs/localhost.crt` and `./certs/localhost.key`.
* SHA-256 TLS fingerprint is calculated and exposed at `GET /health` and `GET /version` for identity verification.

---

## Zero Insecure Overrides
* The system does **not** set `NODE_TLS_REJECT_UNAUTHORIZED=0`.
* It provides a legitimate local trust infrastructure for AI agents and webview clients requiring HTTPS connectivity.

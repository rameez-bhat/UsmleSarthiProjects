# Sarthi SANKET — September 2026 review update

Implemented now:
- Sarthi SANKET branding.
- One active assessment per specialty; archive action instead of permanent assessment deletion.
- Dashboard cards with season, selected/assessed counts, status and last-updated metadata.
- Applicant-profile control fixes: controlled visa values, USCE multi-select, labeled specialty-specific USCE level, descriptive research levels, Step 3 conditional score.
- Program Selection upgraded into Program Workspace with progress, search, status filter, sorting, autosave indicator and persistent state.
- Program identity uses program name + city/state + FREIDA metadata.
- Statuses: Not started, In progress, Research needed, Eligibility mismatch, Override required, Assessed.
- E3 split into E3A score minimums and E3B attempt policy.
- Plain-language eligibility choices while preserving internal codes.
- E4 conditional checklist and E5 documented override UI.
- Blocking eligibility state machine and confidence reduction for source-unavailable eligibility.
- Program-specific answer autosave and partial-work status persistence.
- Historical applicant wording broadened beyond Sarthi-only evidence.
- R1 renamed/expanded to clinical rotation or substantive research relationship.
- Result page no longer exposes raw enum codes and separates Factors limiting score from Warnings.
- Portfolio comparison table with sortable Final Priority/status/program name.
- Final review / draft Excel-compatible export using Export_Columns.

Intentionally deferred:
- Specialty-specific signal inventory counts.
- Automatic Gold/Silver/general signal allocation.
- Inventory-based finalization validation.

No signal counts are hard-coded.

# Risk Register

| Risk | Current Mitigation | Honest Limitation |
| --- | --- | --- |
| External vendor pages change or block retrieval | Seeded workspace, explicit failure records, Web Unlocker default, optional Browser API fallback | Live retrieval can still fail and must not be presented as successful. |
| Browser API costs expand unexpectedly | Disabled by default and capped at one attempt per vendor review | Real Browser API credentials still require deployment verification. |
| AI model invents unsupported claims | Bounded retrieved text, strict JSON, verbatim quote validation, rules fallback | AI/ML API credentials still require deployment verification. |
| AI model influences approval decision | Deterministic rules calculate outcomes after evidence mapping | AI prose is non-authoritative and should remain visibly labeled. |
| Slack delivery fails | Retryable failed state and downloadable draft-only fallback | Slack webhook must be configured and verified before live demo narration. |
| Evidence drift is missed between reviews | Live hashes compare during reviewer-triggered re-verification | No scheduled background monitoring exists yet. |
| Audit history is lost across devices | Browser localStorage preserves the current demo workspace | No database-backed audit retention or multi-user workspace exists yet. |
| Credentials leak into client code | All integration credentials are read server-side; CI secret scan checks common patterns | Production secret scanning should expand before commercial rollout. |
| Scraped text creates unsafe markup | UI escapes dynamic text before inserting it into HTML templates | Continue treating all retrieved text as untrusted input. |

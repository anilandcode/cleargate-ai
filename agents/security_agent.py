from shared.tools import base_payload, emit_finding, read_task


def main():
    task = read_task()
    payload = base_payload("Security Agent", task)
    payload.update(
        {
            "summary": "SOC 2 is mentioned but no current report is attached; SSO and admin controls need confirmation.",
            "findings": [
                "SOC 2 or bridge letter required",
                "SSO unclear for current plan",
                "Admin controls and audit logs need confirmation",
            ],
            "risk_impact": "high",
            "handoff_to": ["Policy Gate Agent"],
        }
    )
    emit_finding(payload)


if __name__ == "__main__":
    main()

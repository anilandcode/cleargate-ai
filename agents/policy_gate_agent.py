from shared.tools import base_payload, emit_finding, read_task


def main():
    task = read_task()
    payload = base_payload("Policy Gate Agent", task)
    payload.update(
        {
            "summary": "Final recommendation is conditionally approved with CISO and Legal approval required.",
            "findings": [
                "Upload latest SOC 2 or bridge letter",
                "Legal must review DPA",
                "Confirm no customer data is used for model training",
                "Enable SSO and admin controls before rollout",
                "Set renewal reminder",
            ],
            "risk_impact": "high",
            "decision": "conditional",
            "handoff_to": ["Human Reviewer"],
        }
    )
    emit_finding(payload)


if __name__ == "__main__":
    main()

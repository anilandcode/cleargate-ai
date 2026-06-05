from shared.tools import base_payload, emit_finding, read_task


def main():
    task = read_task()
    payload = base_payload("Privacy & Legal Agent", task)
    payload.update(
        {
            "summary": "DPA and subprocessors are missing; customer data training terms must be reviewed before approval.",
            "findings": [
                "DPA required before rollout",
                "AI training opt-out must be confirmed",
                "Subprocessor documentation missing",
            ],
            "risk_impact": "high",
            "handoff_to": ["Policy Gate Agent"],
        }
    )
    emit_finding(payload)


if __name__ == "__main__":
    main()

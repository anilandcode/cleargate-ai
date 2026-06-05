from shared.tools import base_payload, emit_finding, read_task


def main():
    task = read_task()
    payload = base_payload("Discovery Agent", task)
    payload.update(
        {
            "summary": "Privacy policy, trust center, and pricing were found; DPA and subprocessors remain missing.",
            "findings": [
                "Privacy policy found",
                "Trust center found",
                "Pricing page found",
                "DPA missing",
                "Subprocessors page missing",
                "AI training policy unclear",
            ],
            "risk_impact": "high",
            "handoff_to": ["Security Agent", "Privacy & Legal Agent", "Finance & Procurement Agent"],
        }
    )
    emit_finding(payload)


if __name__ == "__main__":
    main()

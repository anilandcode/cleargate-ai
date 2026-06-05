from shared.tools import base_payload, emit_finding, read_task


def main():
    task = read_task()
    payload = base_payload("Finance & Procurement Agent", task)
    payload.update(
        {
            "summary": "Spend is inside the approval threshold, but duplicate tooling and renewal controls need review.",
            "findings": [
                "Annual spend is 18000 USD",
                "Duplicate tools exist internally",
                "ROI depends on 30+ active users",
                "Renewal reminder required",
            ],
            "risk_impact": "medium",
            "handoff_to": ["Policy Gate Agent"],
        }
    )
    emit_finding(payload)


if __name__ == "__main__":
    main()

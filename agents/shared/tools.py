import json
import sys
from datetime import datetime, timezone


def read_task():
    raw = sys.stdin.read().strip()
    if not raw:
        return {
            "vendor_id": "synthnote-ai",
            "vendor_name": "SynthNote AI",
            "data_exposure": "high",
            "department": "Sales + Customer Success",
        }
    return json.loads(raw)


def emit_finding(payload):
    payload.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
    print(json.dumps(payload, indent=2))


def base_payload(agent, task):
    return {
        "agent": agent,
        "vendor_id": task.get("vendor_id", "unknown"),
        "vendor_name": task.get("vendor_name", "Unknown vendor"),
        "confidence": 0.84,
    }

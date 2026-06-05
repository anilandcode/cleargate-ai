# ClearGate AI Band Agents

These sample agents show the intended live Band pattern for a hackathon demo. The shipped product works without running them because the browser and server default to deterministic demo mode.

## Install

```bash
cd agents
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
```

The sample code only uses the Python standard library. Add the official Band SDK here when credentials and SDK details are available.

## Configure

Copy the examples:

```bash
cp .env.example .env
cp agent_config.example.yaml agent_config.yaml
```

Set:

```bash
BAND_API_BASE=
BAND_WORKSPACE_ID=
BAND_ROOM_ID=
BAND_API_KEY=
BAND_AGENT_DISCOVERY_ID=
BAND_AGENT_SECURITY_ID=
BAND_AGENT_LEGAL_ID=
BAND_AGENT_FINANCE_ID=
BAND_AGENT_POLICY_ID=
```

## Run

Each file can be run independently:

```bash
python discovery_agent.py
python security_agent.py
python privacy_legal_agent.py
python finance_procurement_agent.py
python policy_gate_agent.py
```

Each agent reads a task payload from stdin and prints a structured JSON finding. A live Band adapter can replace the stdin/stdout bridge with room-event subscriptions.

## Demo Fallback

If `BAND_LIVE=1` or Band credentials are missing, invalid, or the live request fails, the JavaScript server returns the deterministic demo room. No API key is required for the judge path.

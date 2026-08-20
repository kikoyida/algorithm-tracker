import json
import os
import re
from datetime import datetime
from pathlib import Path


DATA_PATH = Path(os.environ.get("FOCUS_DATA_PATH", Path(__file__).with_name("focus-data.json")))


def required(name):
    value = os.environ.get(name, "").strip()
    if not value:
        raise ValueError(f"Missing {name}")
    return value


def parse_timestamp(name):
    value = required(name)
    datetime.fromisoformat(value.replace("Z", "+00:00"))
    return value


def build_session():
    session_id = required("FOCUS_SESSION_ID")
    local_date = required("FOCUS_LOCAL_DATE")
    if not re.fullmatch(r"[A-Za-z0-9-]{1,100}", session_id):
        raise ValueError("Invalid session id")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", local_date):
        raise ValueError("Invalid local date")
    datetime.strptime(local_date, "%Y-%m-%d")
    duration = int(required("FOCUS_DURATION_SECONDS"))
    if not 1 <= duration <= 24 * 60 * 60:
        raise ValueError("Invalid focus duration")
    return {
        "id": session_id,
        "taskName": required("FOCUS_TASK_NAME")[:80],
        "startedAt": parse_timestamp("FOCUS_STARTED_AT"),
        "completedAt": parse_timestamp("FOCUS_COMPLETED_AT"),
        "updatedAt": parse_timestamp("FOCUS_UPDATED_AT"),
        "localDate": local_date,
        "durationSeconds": duration,
        "completed": required("FOCUS_COMPLETED").lower() == "true",
    }


def load_sessions():
    if not DATA_PATH.exists():
        return []
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    return payload.get("sessions", [])


def main():
    incoming = build_session()
    sessions = load_sessions()
    existing_index = next((index for index, item in enumerate(sessions) if item.get("id") == incoming["id"]), None)
    if existing_index is None:
        sessions.append(incoming)
        action = "Stored"
    else:
        existing = sessions[existing_index]
        is_newer = incoming["updatedAt"] > existing.get("updatedAt", existing.get("completedAt", ""))
        is_longer = incoming["durationSeconds"] > int(existing.get("durationSeconds", 0))
        is_completion = incoming["completed"] and not existing.get("completed", False)
        if not (is_newer or is_longer or is_completion):
            print(f"Focus session {incoming['id']} is already current")
            return
        sessions[existing_index] = incoming
        action = "Updated"
    sessions.sort(key=lambda item: item.get("completedAt", ""))
    DATA_PATH.write_text(
        json.dumps({"sessions": sessions[-5000:]}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"{action} focus session {incoming['id']}")


if __name__ == "__main__":
    main()

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import record_focus


class RecordFocusTests(unittest.TestCase):
    def test_newer_snapshot_updates_same_session_without_double_counting(self):
        base = {
            "FOCUS_SESSION_ID": "11111111-1111-4111-8111-111111111111",
            "FOCUS_TASK_NAME": "Read one chapter",
            "FOCUS_STARTED_AT": "2026-08-21T01:00:00.000Z",
            "FOCUS_COMPLETED_AT": "2026-08-21T01:01:00.000Z",
            "FOCUS_UPDATED_AT": "2026-08-21T01:01:00.000Z",
            "FOCUS_LOCAL_DATE": "2026-08-21",
            "FOCUS_DURATION_SECONDS": "60",
            "FOCUS_COMPLETED": "false",
        }
        with tempfile.TemporaryDirectory() as directory:
            record_focus.DATA_PATH = Path(directory) / "focus-data.json"
            with patch.dict(os.environ, base, clear=False):
                record_focus.main()
            updated = {**base, "FOCUS_DURATION_SECONDS": "120", "FOCUS_COMPLETED": "true", "FOCUS_UPDATED_AT": "2026-08-21T01:02:00.000Z"}
            with patch.dict(os.environ, updated, clear=False):
                record_focus.main()
            sessions = json.loads(record_focus.DATA_PATH.read_text(encoding="utf-8"))["sessions"]
            self.assertEqual(len(sessions), 1)
            self.assertEqual(sessions[0]["durationSeconds"], 120)
            self.assertTrue(sessions[0]["completed"])


if __name__ == "__main__":
    unittest.main()

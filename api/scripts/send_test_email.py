"""Send one real test email through the configured SMTP backend.

Usage (from the api/ directory, with the venv python):
    python scripts/send_test_email.py [recipient]

Reads SMTP settings from .env. If `recipient` is omitted it sends to SMTP_USER
(i.e. yourself). Surfaces the real SMTP error instead of swallowing it, so a
misconfiguration is obvious.
"""
import sys
from pathlib import Path

# Make `app` importable when run directly as `python scripts/send_test_email.py`.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from app.email import _smtp_send

settings = get_settings()


def main() -> int:
    if not settings.smtp_host:
        print("SMTP_HOST is empty — still in console mode. Fill the SMTP_* vars")
        print("in api/.env (see the comments there) and try again.")
        return 1

    recipient = sys.argv[1] if len(sys.argv) > 1 else settings.smtp_user
    if not recipient:
        print("No recipient: pass one as an argument or set SMTP_USER in .env.")
        return 1

    print(f"Sending test email via {settings.smtp_host}:{settings.smtp_port} -> {recipient} ...")
    try:
        _smtp_send(
            recipient,
            "minitask SMTP test",
            "If you can read this, real email delivery works. 🎉",
        )
    except Exception as exc:  # noqa: BLE001 — we want the raw reason printed
        print(f"FAILED: {type(exc).__name__}: {exc}")
        print("\nCommon causes:")
        print("  - SMTP_PASSWORD must be a Gmail *app password* (16 chars), not your login.")
        print("  - 2-Step Verification must be enabled on the Google account.")
        print("  - SMTP_USER / EMAIL_FROM should be the same Gmail address.")
        return 1

    print("OK — sent. Check the inbox (and the spam folder just in case).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

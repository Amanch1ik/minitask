"""Pluggable, dependency-light email sending with branded HTML templates.

Default (free, zero-setup) backend logs the message — including any link — to
the API log, so the verification / reset flow works locally without an account.
Set `SMTP_HOST` (and friends) in `.env` to send real mail via SMTP; sending runs
in a worker thread so the async request is never blocked.
"""
import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.config import get_settings

logger = logging.getLogger("minitask.email")

_settings = get_settings()

_BRAND = "Минитаск"
_CORAL = "#f06a6a"


async def send_email(to: str, subject: str, text: str, html: str | None = None) -> None:
    if not _settings.smtp_host:
        _log_backend(to, subject, text)
        return
    try:
        await asyncio.to_thread(_smtp_send, to, subject, text, html)
    except Exception:
        # Delivery is best-effort relative to the HTTP request — a misconfigured
        # or down SMTP must not 500 a registration. Log loudly; the user can
        # re-request the link once mail is working again.
        logger.exception("[email:smtp] failed to send to %s (subject: %s)", to, subject)


def _log_backend(to: str, subject: str, text: str) -> None:
    logger.warning(
        "[email:console] no SMTP configured — would send to %s\n  Subject: %s\n%s",
        to,
        subject,
        "\n".join(f"  {line}" for line in text.splitlines()),
    )


def _smtp_send(to: str, subject: str, text: str, html: str | None = None) -> None:
    msg = EmailMessage()
    msg["From"] = _settings.email_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text)
    if html:
        msg.add_alternative(html, subtype="html")

    with smtplib.SMTP(_settings.smtp_host, _settings.smtp_port, timeout=15) as smtp:
        if _settings.smtp_tls:
            smtp.starttls()
        if _settings.smtp_user:
            smtp.login(_settings.smtp_user, _settings.smtp_password)
        smtp.send_message(msg)


def _render_html(*, heading: str, intro: str, button_label: str, button_url: str, footnote: str) -> str:
    """A clean, email-client-safe template: inline styles, table layout, a
    coral logo tile, a heading, a CTA button and a plain-link fallback."""
    return f"""\
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f3f1;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f1;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e8e8e9;overflow:hidden;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
          <tr><td style="padding:32px 32px 8px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:44px;height:44px;border-radius:12px;background:#f06a6a;background:linear-gradient(135deg,#f87a6a,#ec4f4f);color:#ffffff;font-size:24px;font-weight:700;text-align:center;line-height:44px;">&#10003;</td>
              <td style="padding-left:12px;font-size:18px;font-weight:600;color:#1e1f21;letter-spacing:-0.01em;">{_BRAND}</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:20px 32px 0 32px;">
            <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:600;color:#1e1f21;letter-spacing:-0.01em;">{heading}</h1>
            <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#6d6e6f;">{intro}</p>
          </td></tr>
          <tr><td style="padding:24px 32px 8px 32px;">
            <a href="{button_url}" style="display:inline-block;background:#f06a6a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 24px;border-radius:10px;">{button_label}</a>
          </td></tr>
          <tr><td style="padding:8px 32px 4px 32px;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#9ca0a3;">Или скопируйте ссылку в браузер:</p>
            <p style="margin:4px 0 0 0;font-size:13px;line-height:1.6;word-break:break-all;"><a href="{button_url}" style="color:#e15a5a;">{button_url}</a></p>
          </td></tr>
          <tr><td style="padding:20px 32px 32px 32px;border-top:1px solid #f0efed;margin-top:16px;">
            <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:#9ca0a3;">{footnote}</p>
          </td></tr>
        </table>
        <p style="max-width:480px;margin:16px auto 0 auto;font-size:11px;color:#b6b8ba;font-family:Inter,Arial,sans-serif;">{_BRAND} — доска для задач, без лишнего.</p>
      </td></tr>
    </table>
  </body>
</html>"""


async def send_verification_email(to: str, link: str) -> None:
    text = (
        f"Добро пожаловать в {_BRAND}!\n\n"
        "Подтвердите email, чтобы завершить создание аккаунта:\n\n"
        f"{link}\n\n"
        "Если вы не регистрировались, просто проигнорируйте это письмо."
    )
    html = _render_html(
        heading="Подтвердите email",
        intro="Остался один шаг — подтвердите адрес, чтобы завершить регистрацию и войти в аккаунт.",
        button_label="Подтвердить email",
        button_url=link,
        footnote="Если вы не регистрировались в Минитаске, просто проигнорируйте это письмо.",
    )
    await send_email(to, f"Подтвердите аккаунт {_BRAND}", text, html)


async def send_reset_email(to: str, link: str) -> None:
    text = (
        f"Запрос на сброс пароля в {_BRAND}.\n\n"
        "Задайте новый пароль по ссылке (срок действия ограничен):\n\n"
        f"{link}\n\n"
        "Если вы не запрашивали сброс, просто проигнорируйте это письмо."
    )
    html = _render_html(
        heading="Сброс пароля",
        intro="Мы получили запрос на сброс пароля. Нажмите кнопку, чтобы задать новый. Ссылка скоро истечёт.",
        button_label="Сбросить пароль",
        button_url=link,
        footnote="Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо — пароль не изменится.",
    )
    await send_email(to, f"Сброс пароля {_BRAND}", text, html)

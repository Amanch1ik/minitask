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


def _render_html(
    *,
    heading: str,
    intro: str,
    button_label: str,
    button_url: str,
    footnote: str,
    preheader: str | None = None,
) -> str:
    """A polished, email-client-safe template: table layout with inline styles,
    a coral hero badge, a bulletproof gradient CTA button (degrades to a solid
    square in Outlook), a copy-paste link fallback and a hidden preheader for the
    inbox preview line."""
    preview = preheader or intro
    return f"""\
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f1efec;-webkit-font-smoothing:antialiased;text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">{preview}&#847;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1efec;">
      <tr><td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:20px;border:1px solid #e8e8e9;overflow:hidden;font-family:'Inter',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr><td style="height:4px;line-height:4px;font-size:0;background:#f06a6a;background:linear-gradient(90deg,#f87a6a,#ec4f4f);">&nbsp;</td></tr>
          <tr><td align="center" style="padding:44px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="center" valign="middle" width="64" height="64" style="width:64px;height:64px;border-radius:18px;background:#f06a6a;background:linear-gradient(135deg,#f87a6a,#ec4f4f);color:#ffffff;font-size:34px;line-height:64px;text-align:center;font-family:Arial,sans-serif;">&#10003;</td>
            </tr></table>
          </td></tr>
          <tr><td align="center" style="padding:18px 32px 0 32px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#b0b3b5;">{_BRAND}</p>
          </td></tr>
          <tr><td align="center" style="padding:10px 36px 0 36px;">
            <h1 style="margin:0;font-size:25px;line-height:1.25;font-weight:700;color:#1e1f21;letter-spacing:-0.02em;">{heading}</h1>
          </td></tr>
          <tr><td align="center" style="padding:12px 40px 0 40px;">
            <p style="margin:0;font-size:15px;line-height:1.65;color:#6d6e6f;">{intro}</p>
          </td></tr>
          <tr><td align="center" style="padding:28px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
              <td align="center" bgcolor="#f06a6a" style="border-radius:12px;background:#f06a6a;background:linear-gradient(135deg,#f87a6a,#ec4f4f);box-shadow:0 6px 16px -4px rgba(236,79,79,0.45);">
                <a href="{button_url}" target="_blank" style="display:inline-block;padding:15px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;font-family:'Inter',Arial,sans-serif;">{button_label}</a>
              </td>
            </tr></table>
          </td></tr>
          <tr><td align="center" style="padding:18px 36px 0 36px;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca0a3;">Кнопка не открывается? Скопируйте ссылку в браузер:</p>
            <p style="margin:6px 0 0 0;font-size:12px;line-height:1.6;word-break:break-all;"><a href="{button_url}" target="_blank" style="color:#e15a5a;text-decoration:none;">{button_url}</a></p>
          </td></tr>
          <tr><td style="padding:28px 32px 0 32px;"><div style="height:1px;line-height:1px;font-size:0;background:#f0efed;">&nbsp;</div></td></tr>
          <tr><td style="padding:18px 36px 40px 36px;">
            <p style="margin:0;font-size:12px;line-height:1.65;color:#9ca0a3;">{footnote}</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
          <tr><td align="center" style="padding:18px 0 0 0;">
            <p style="margin:0;font-size:11px;line-height:1.6;color:#b6b8ba;font-family:'Inter',Arial,sans-serif;">{_BRAND} — доска для задач, без лишнего.</p>
          </td></tr>
        </table>
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
        heading="Подтвердите почту",
        intro="Остался один шаг. Нажмите кнопку ниже, чтобы подтвердить адрес и войти в аккаунт.",
        button_label="Подтвердить почту",
        button_url=link,
        footnote="Ссылка действует ограниченное время. Если вы не регистрировались в Минитаске, просто проигнорируйте это письмо — аккаунт не активируется.",
        preheader="Подтвердите адрес, чтобы завершить регистрацию в Минитаске.",
    )
    await send_email(to, f"Добро пожаловать в {_BRAND} — подтвердите почту", text, html)


async def send_reset_email(to: str, link: str) -> None:
    text = (
        f"Запрос на сброс пароля в {_BRAND}.\n\n"
        "Задайте новый пароль по ссылке (срок действия ограничен):\n\n"
        f"{link}\n\n"
        "Если вы не запрашивали сброс, просто проигнорируйте это письмо."
    )
    html = _render_html(
        heading="Сброс пароля",
        intro="Мы получили запрос на смену пароля. Нажмите кнопку, чтобы задать новый — ссылка скоро истечёт.",
        button_label="Задать новый пароль",
        button_url=link,
        footnote="Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо — пароль останется прежним.",
        preheader="Задайте новый пароль для аккаунта Минитаск.",
    )
    await send_email(to, f"Сброс пароля {_BRAND}", text, html)

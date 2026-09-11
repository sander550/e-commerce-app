import aiosmtplib
from email.message import EmailMessage
from core.config.settings import settings

class SmtpSender:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.username = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.sender = settings.SMTP_SENDER

    async def send(self, to_email: str, subject: str, body: str):
        msg = EmailMessage()
        msg["From"] = self.sender
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(body)

        await aiosmtplib.send(
            msg,
            hostname=self.host,
            port=self.port,
            username=self.username,
            password=self.password,
            start_tls=True
        )

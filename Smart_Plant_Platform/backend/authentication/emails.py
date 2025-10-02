import random
import string
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

User = get_user_model()

frontend_url = settings.FRONTEND_URL


def send_otp(email):
    try:
        otp = "".join([str(random.randint(0, 9)) for _ in range(6)])

        subject = "Account Verification Email From FYP"
        message = (
            f"We have received a sign-in attempt for your email.\n"
            f"Your OTP is {otp}.\n"
            f"To complete the verification enter the 6 digit code in the original window.\n"
            f"Or visit the link below to open the confirmation page in a new window or device:\n"
            f"{frontend_url}/verify?email={email}"
        )
        email_from = settings.EMAIL_HOST

        with transaction.atomic():
            user_obj = User.objects.get(email=email)

            user_obj.otp = otp
            user_obj.save()

        send_mail(subject, message, email_from, [email])
        return True, "OTP sent successfully"

    except User.DoesNotExist:
        return False, "User with this email does not exist"
    except Exception as e:
        return False, f"Failed to send OTP: {str(e)}"

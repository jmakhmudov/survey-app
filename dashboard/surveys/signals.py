from django.db.models.signals import post_save
from django.dispatch import receiver
import requests
from django.conf import settings
from .models import Survey
from branches.models import Client

def get_all_client_ids():
    try:
        client_ids = Client.objects.values_list('id', flat=True)
        return list(client_ids)
    except Client.DoesNotExist:
        return []

def sendPushNotif(id, message):
    payload = {
        'chat_id': id,
        'text': message,
        'parse_mode': 'HTML',
    }
    try:
        response = requests.post("https://api.telegram.org/bot6428031744:AAF2POTizOUsK_LOSfVFd9ptNcumNyp9oFE/sendMessage", json=payload)
        response.raise_for_status()
        print("Telegram message sent successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Error sending Telegram message: {e}")

@receiver(post_save, sender=Survey)
def send_telegram_notification(sender, instance, **kwargs):

    all_client_ids = get_all_client_ids()
    message = f"<b>{instance.name}</b>\n\nОписание: {instance.description}\n\n<i>Скорее пройдите опросник и получите приз!</i>"
    
    for id in all_client_ids:
        sendPushNotif(id, message)


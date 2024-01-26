from django.contrib.auth.models import User
from django.db import models

from branches.models import Client, Branch

from .survey import Survey


class Response(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Филиал')
    created = models.DateTimeField(("Дата создания"), auto_now_add=True)
    updated = models.DateTimeField(("Дата обновления"), auto_now=True)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, verbose_name=("Опрос"), related_name="responses")
    client = models.ForeignKey(Client, verbose_name=("Клиент"), on_delete=models.CASCADE)

    class Meta:
        verbose_name = ("Ответы на опросники")
        verbose_name_plural = ("Ответы на опросники")

    def __str__(self):
        msg = f"Ответ на {self.survey} пользователя {self.client.full_name}"
        msg += f" on {self.created}"
        return msg

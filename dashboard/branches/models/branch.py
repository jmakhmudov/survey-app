from django.db import models

class Branch(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название')
    address = models.CharField(max_length=255, verbose_name='Адрес', default="")

    class Meta:
        verbose_name = ("филиал")
        verbose_name_plural = ("филиалы")

    def __str__(self):
        return f"{self.name}"

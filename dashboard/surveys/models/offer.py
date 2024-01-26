from django.db import models
from django.utils.text import slugify

from .survey import Survey

class Offer(models.Model):
    amount = models.FloatField(("Проценты"), blank=True, null=True)
    percent = models.FloatField(("Сумма"), blank=True, null=True)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, verbose_name=("Опросник"), related_name="offers")
    description = models.CharField(("Описание"), max_length=2000)
    img = models.ImageField(verbose_name=("Картинка"), blank=True, null=True, upload_to="images/")

    class Meta:
        verbose_name = ("оффер")
        verbose_name_plural = ("офферы")

    def slugify(self):
        return slugify(str(self))

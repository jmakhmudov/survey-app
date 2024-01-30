from django.db import models
from .branch import Branch
from django.core.validators import MinValueValidator

class Client(models.Model):
    GENDER_CHOICES = [
        ('М', 'Мужчина'),
        ('Ж', 'Женщина'),
    ]

    id = models.IntegerField(primary_key=True)
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name='Пол')
    age = models.IntegerField(
        validators=[MinValueValidator(limit_value=10)],
        verbose_name='Возраст'
    )
    phone_number = models.CharField(max_length=20, verbose_name='Номер телефона')
    joined = models.DateTimeField(auto_now=True, verbose_name='Дата регистрации')
    
    class Meta:
        verbose_name = ("клиент")
        verbose_name_plural = ("клиенты") 

    def __str__(self):
        return self.full_name
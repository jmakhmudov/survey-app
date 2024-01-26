from datetime import timedelta

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils.timezone import now
from branches.models import Branch

def in_duration_day():
    return now() + timedelta(days=settings.DEFAULT_SURVEY_PUBLISHING_DURATION)


class Survey(models.Model):
    BY_QUESTION = 1
    BY_CATEGORY = 2


    name = models.CharField(("Название"), max_length=400)
    description = models.TextField(("Описание"))
    is_published = models.BooleanField(("Виден клиенту"), default=True)
    publish_date = models.DateField(("Дата публикации"), blank=True, null=False, default=now)
    expire_date = models.DateField(("Дата окончания"), blank=True, null=False, default=in_duration_day)
    branches = models.ManyToManyField(Branch, blank=True, verbose_name=("Филиалы"))

    class Meta:
        verbose_name = ("опросник")
        verbose_name_plural = ("опросники")

    def __str__(self):
        return self.name

    @property
    def safe_name(self):
        return self.name.replace(" ", "_").encode("utf-8").decode("ISO-8859-1")

    def latest_answer_date(self):
        """Return the latest answer date.

        Return None is there is no response."""
        min_ = None
        for response in self.responses.all():
            if min_ is None or min_ < response.updated:
                min_ = response.updated
        return min_

    def non_empty_categories(self):
        return [x for x in list(self.categories.order_by("order", "id")) if x.questions.count() > 0]

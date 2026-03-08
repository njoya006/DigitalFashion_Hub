from django.db import models


class Currency(models.Model):
    code = models.CharField(max_length=10, unique=True)   # e.g. USD
    name = models.CharField(max_length=100)               # e.g. US Dollar
    symbol = models.CharField(max_length=10)              # e.g. $
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'currencies'
        ordering = ['code']

    def __str__(self):
        return f'{self.code} — {self.name}'


class ExchangeRate(models.Model):
    """Exchange rate relative to USD base."""
    currency = models.OneToOneField(Currency, on_delete=models.CASCADE, related_name='rate')
    rate = models.DecimalField(max_digits=16, decimal_places=6)  # 1 USD = rate * currency
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'1 USD = {self.rate} {self.currency.code}'

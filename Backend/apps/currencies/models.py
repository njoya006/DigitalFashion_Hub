from django.db import models


class Currency(models.Model):
	currency_code = models.CharField(max_length=3, primary_key=True)
	currency_name = models.CharField(max_length=50)
	symbol = models.CharField(max_length=10, null=True, blank=True)
	is_active = models.BooleanField(default=True)

	class Meta:
		managed = False
		db_table = "currencies"


class ExchangeRate(models.Model):
	rate_id = models.AutoField(primary_key=True)
	from_currency = models.ForeignKey(
		Currency,
		on_delete=models.RESTRICT,
		db_column="from_currency",
		related_name="outgoing_rates",
		to_field="currency_code",
	)
	to_currency = models.ForeignKey(
		Currency,
		on_delete=models.RESTRICT,
		db_column="to_currency",
		related_name="incoming_rates",
		to_field="currency_code",
	)
	rate = models.DecimalField(max_digits=18, decimal_places=6)
	effective_date = models.DateTimeField()
	source = models.CharField(max_length=50, default="OpenExchangeRates")

	class Meta:
		managed = False
		db_table = "exchange_rates"


from datetime import datetime, timezone
from decimal import Decimal
import json
from urllib import parse, request

from django.db import transaction

from .models import ExchangeRate


def fetch_openexchange_rates(app_id: str, base_currency: str = "USD", timeout_seconds: int = 15):
    query = parse.urlencode({"app_id": app_id, "base": base_currency})
    url = f"https://openexchangerates.org/api/latest.json?{query}"

    with request.urlopen(url, timeout=timeout_seconds) as resp:
        payload = json.loads(resp.read().decode("utf-8"))

    timestamp = payload.get("timestamp")
    rates = payload.get("rates", {})
    effective_dt = datetime.fromtimestamp(timestamp, tz=timezone.utc) if timestamp else datetime.now(timezone.utc)

    return rates, effective_dt


def persist_exchange_rates(base_currency: str, rates: dict, effective_dt, source: str = "OpenExchangeRates"):
    if not rates:
        return 0

    created_count = 0
    base = base_currency.upper().strip()

    with transaction.atomic():
        for target_currency, target_rate in rates.items():
            target = target_currency.upper().strip()
            if target == base:
                continue

            rate_decimal = Decimal(str(target_rate))
            if rate_decimal <= 0:
                continue

            # base -> target
            ExchangeRate.objects.create(
                from_currency_id=base,
                to_currency_id=target,
                rate=rate_decimal,
                effective_date=effective_dt,
                source=source,
            )
            created_count += 1

            # target -> base
            reverse_rate = Decimal("1") / rate_decimal
            ExchangeRate.objects.create(
                from_currency_id=target,
                to_currency_id=base,
                rate=reverse_rate,
                effective_date=effective_dt,
                source=source,
            )
            created_count += 1

    return created_count

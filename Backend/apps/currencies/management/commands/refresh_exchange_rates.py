from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.currencies.services import fetch_openexchange_rates, persist_exchange_rates


class Command(BaseCommand):
    help = "Refresh exchange rates from Open Exchange Rates provider"

    def handle(self, *args, **options):
        app_id = settings.OPENEXCHANGE_APP_ID
        if not app_id:
            raise CommandError("OPENEXCHANGE_APP_ID is not configured.")

        rates, effective_dt = fetch_openexchange_rates(
            app_id=app_id,
            base_currency=settings.EXCHANGE_BASE_CURRENCY,
            timeout_seconds=settings.EXCHANGE_REFRESH_TIMEOUT,
        )
        inserted = persist_exchange_rates(settings.EXCHANGE_BASE_CURRENCY, rates, effective_dt)

        self.stdout.write(
            self.style.SUCCESS(
                f"Exchange rates refreshed. Inserted {inserted} rows for base {settings.EXCHANGE_BASE_CURRENCY}."
            )
        )

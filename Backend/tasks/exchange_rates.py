import importlib

try:
    _celery_module = importlib.import_module("celery")
    shared_task = _celery_module.shared_task
except Exception:
    def shared_task(*_args, **_kwargs):
        def _decorator(func):
            return func

        return _decorator
from django.conf import settings

from apps.currencies.services import fetch_openexchange_rates, persist_exchange_rates


@shared_task(name="tasks.refresh_exchange_rates")
def refresh_exchange_rates_task():
    app_id = settings.OPENEXCHANGE_APP_ID
    if not app_id:
        return {"success": False, "error": "OPENEXCHANGE_APP_ID is not configured."}

    rates, effective_dt = fetch_openexchange_rates(
        app_id=app_id,
        base_currency=settings.EXCHANGE_BASE_CURRENCY,
        timeout_seconds=settings.EXCHANGE_REFRESH_TIMEOUT,
    )
    inserted = persist_exchange_rates(settings.EXCHANGE_BASE_CURRENCY, rates, effective_dt)

    return {
        "success": True,
        "inserted_rows": inserted,
        "effective_date": effective_dt.isoformat(),
        "base_currency": settings.EXCHANGE_BASE_CURRENCY,
    }

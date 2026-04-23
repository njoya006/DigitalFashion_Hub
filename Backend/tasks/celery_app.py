import os

try:
	from celery import Celery
except Exception:
	Celery = None

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

if Celery is not None:
	app = Celery("digitalfashion_hub")
	app.config_from_object("django.conf:settings", namespace="CELERY")
	app.autodiscover_tasks(["tasks"])
else:
	app = None

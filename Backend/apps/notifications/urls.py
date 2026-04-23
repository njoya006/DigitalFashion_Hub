from django.urls import path

from .views import NotificationListView, NotificationMarkAllReadView, NotificationMarkReadView

urlpatterns = [
	path("", NotificationListView.as_view(), name="notifications-list"),
	path("mark-all-read/", NotificationMarkAllReadView.as_view(), name="notifications-mark-all-read"),
	path("<int:notification_id>/read/", NotificationMarkReadView.as_view(), name="notifications-mark-read"),
]


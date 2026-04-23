from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class NotificationListView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="List my notifications", tags=["Notifications"])
	def get(self, request):
		filters = ["user_id = %s"]
		params = [str(request.user.user_id)]
		if str(request.query_params.get("read", "")).lower() == "true":
			filters.append("COALESCE(is_read, FALSE) = TRUE")
		elif str(request.query_params.get("read", "")).lower() == "false":
			filters.append("COALESCE(is_read, FALSE) = FALSE")

		where_clause = f"WHERE {' AND '.join(filters)}"
		limit = min(int(request.query_params.get("limit", 100)), 200)
		offset = max(int(request.query_params.get("offset", 0)), 0)

		with connection.cursor() as cursor:
			cursor.execute(
				f"""
				SELECT notification_id, user_id, type, message, is_read, created_at
				FROM notifications
				{where_clause}
				ORDER BY created_at DESC
				LIMIT %s OFFSET %s
				""",
				params + [limit, offset],
			)
			columns = [col[0] for col in cursor.description]
			data = [dict(zip(columns, row)) for row in cursor.fetchall()]

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="Mark notification as read", tags=["Notifications"])
	def post(self, request, notification_id):
		with connection.cursor() as cursor:
			cursor.execute(
				"""
				UPDATE notifications
				SET is_read = TRUE
				WHERE notification_id = %s AND user_id = %s
				RETURNING notification_id, user_id, type, message, is_read, created_at
				""",
				[int(notification_id), str(request.user.user_id)],
			)
			row = cursor.fetchone()
			if not row:
				return Response({"success": False, "error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
			columns = [col[0] for col in cursor.description]
			data = dict(zip(columns, row))

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="Mark all notifications as read", tags=["Notifications"])
	def post(self, request):
		with connection.cursor() as cursor:
			cursor.execute(
				"""
				UPDATE notifications
				SET is_read = TRUE
				WHERE user_id = %s AND COALESCE(is_read, FALSE) = FALSE
				RETURNING notification_id
				""",
				[str(request.user.user_id)],
			)
			updated = cursor.rowcount

		return Response({"success": True, "data": {"updated_rows": updated}}, status=status.HTTP_200_OK)

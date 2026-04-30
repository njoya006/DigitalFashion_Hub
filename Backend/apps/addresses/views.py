from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import AddressSerializer


class AddressListView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="List user addresses", tags=["Addresses"])
	def get(self, request):
		"""Get all addresses for current user, ordered by default status"""
		with connection.cursor() as cursor:
			cursor.execute(
				"""
				SELECT address_id, street, city, state, postal_code, country, phone, recipient_name, is_default, created_at
				FROM addresses
				WHERE user_id = %s
				ORDER BY is_default DESC, created_at DESC
				""",
				[str(request.user.user_id)],
			)
			columns = [col[0] for col in cursor.description]
			addresses = [dict(zip(columns, row)) for row in cursor.fetchall()]

		return Response({"success": True, "data": addresses}, status=status.HTTP_200_OK)

	@extend_schema(summary="Create address", tags=["Addresses"], request=AddressSerializer)
	def post(self, request):
		"""Create new address for current user"""
		serializer = AddressSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		payload = serializer.validated_data

		with connection.cursor() as cursor:
			cursor.execute(
				"""
				INSERT INTO addresses
				(user_id, street, city, state, postal_code, country, phone, recipient_name, is_default)
				VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
				RETURNING address_id, street, city, state, postal_code, country, phone, recipient_name, is_default, created_at
				""",
				[
					str(request.user.user_id),
					payload["street"],
					payload["city"],
					payload.get("state", ""),
					payload["postal_code"],
					payload["country"],
					payload.get("phone", ""),
					payload["recipient_name"],
					payload.get("is_default", False),
				],
			)
			row = cursor.fetchone()
			columns = [col[0] for col in cursor.description]
			address = dict(zip(columns, row))

		return Response({"success": True, "data": address}, status=status.HTTP_201_CREATED)


class AddressDetailView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="Update address", tags=["Addresses"], request=AddressSerializer)
	def put(self, request, address_id):
		"""Update address (owner only)"""
		serializer = AddressSerializer(data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		payload = serializer.validated_data

		with connection.cursor() as cursor:
			# Check ownership
			cursor.execute("SELECT user_id FROM addresses WHERE address_id = %s", [address_id])
			row = cursor.fetchone()
			if not row or str(row[0]) != str(request.user.user_id):
				return Response(
					{"success": False, "error": "Access denied"},
					status=status.HTTP_403_FORBIDDEN,
				)

			# Update
			cursor.execute(
				"""
				UPDATE addresses
				SET street=%s, city=%s, state=%s, postal_code=%s, country=%s, phone=%s, recipient_name=%s, is_default=%s
				WHERE address_id=%s
				RETURNING address_id, street, city, state, postal_code, country, phone, recipient_name, is_default, created_at
				""",
				[
					payload.get("street"),
					payload.get("city"),
					payload.get("state"),
					payload.get("postal_code"),
					payload.get("country"),
					payload.get("phone"),
					payload.get("recipient_name"),
					payload.get("is_default", False),
					address_id,
				],
			)
			row = cursor.fetchone()
			if not row:
				return Response(
					{"success": False, "error": "Address not found"},
					status=status.HTTP_404_NOT_FOUND,
				)
			columns = [col[0] for col in cursor.description]
			address = dict(zip(columns, row))

		return Response({"success": True, "data": address}, status=status.HTTP_200_OK)

	@extend_schema(summary="Delete address", tags=["Addresses"])
	def delete(self, request, address_id):
		"""Delete address (owner only)"""
		with connection.cursor() as cursor:
			cursor.execute("SELECT user_id FROM addresses WHERE address_id = %s", [address_id])
			row = cursor.fetchone()
			if not row or str(row[0]) != str(request.user.user_id):
				return Response(
					{"success": False, "error": "Access denied"},
					status=status.HTTP_403_FORBIDDEN,
				)

			cursor.execute("DELETE FROM addresses WHERE address_id = %s", [address_id])

		return Response({"success": True, "message": "Address deleted"}, status=status.HTTP_200_OK)

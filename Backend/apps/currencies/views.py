from django.conf import settings
from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdmin

from .models import Currency
from .serializers import ConvertPriceQuerySerializer, CurrencySerializer
from .services import fetch_openexchange_rates, persist_exchange_rates


class CurrencyListView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="List currencies", tags=["Currencies"])
	def get(self, request):
		rows = Currency.objects.filter(is_active=True).order_by("currency_code")
		return Response({"success": True, "data": CurrencySerializer(rows, many=True).data}, status=status.HTTP_200_OK)


class LatestRatesView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="Get latest rates", tags=["Currencies"])
	def get(self, request):
		from_currency = request.query_params.get("from")
		to_currency = request.query_params.get("to")

		filters = []
		params = []
		if from_currency:
			filters.append("from_currency = %s")
			params.append(from_currency.upper().strip())
		if to_currency:
			filters.append("to_currency = %s")
			params.append(to_currency.upper().strip())

		where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

		query = f"""
			SELECT DISTINCT ON (from_currency, to_currency)
				from_currency,
				to_currency,
				rate,
				effective_date,
				source
			FROM exchange_rates
			{where_clause}
			ORDER BY from_currency, to_currency, effective_date DESC
		"""

		with connection.cursor() as cursor:
			cursor.execute(query, params)
			columns = [col[0] for col in cursor.description]
			data = [dict(zip(columns, row)) for row in cursor.fetchall()]

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class ConvertPriceView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="Convert amount across currencies", tags=["Currencies"])
	def get(self, request):
		serializer = ConvertPriceQuerySerializer(data=request.query_params)
		serializer.is_valid(raise_exception=True)
		payload = serializer.validated_data

		with connection.cursor() as cursor:
			cursor.execute(
				"SELECT fn_convert_price(%s::decimal, %s::char(3), %s::char(3))",
				[payload["amount"], payload["from_currency"], payload["to_currency"]],
			)
			converted = cursor.fetchone()[0]

		return Response(
			{
				"success": True,
				"data": {
					"amount": str(payload["amount"]),
					"from_currency": payload["from_currency"],
					"to_currency": payload["to_currency"],
					"converted": str(converted),
				},
			},
			status=status.HTTP_200_OK,
		)


class RefreshRatesView(APIView):
	permission_classes = [IsAuthenticated, IsAdmin]

	@extend_schema(summary="Refresh exchange rates from provider", tags=["Currencies"])
	def post(self, request):
		app_id = settings.OPENEXCHANGE_APP_ID
		if not app_id:
			return Response(
				{
					"success": False,
					"error": "OPENEXCHANGE_APP_ID is not configured.",
				},
				status=status.HTTP_400_BAD_REQUEST,
			)

		rates, effective_dt = fetch_openexchange_rates(
			app_id=app_id,
			base_currency=settings.EXCHANGE_BASE_CURRENCY,
			timeout_seconds=settings.EXCHANGE_REFRESH_TIMEOUT,
		)
		inserted = persist_exchange_rates(settings.EXCHANGE_BASE_CURRENCY, rates, effective_dt)

		return Response(
			{
				"success": True,
				"message": "Exchange rates refreshed.",
				"data": {
					"inserted_rows": inserted,
					"effective_date": effective_dt,
					"base_currency": settings.EXCHANGE_BASE_CURRENCY,
				},
			},
			status=status.HTTP_200_OK,
		)


from rest_framework import serializers


class AddressSerializer(serializers.Serializer):
	address_id = serializers.IntegerField(read_only=True)
	street = serializers.CharField(max_length=255)
	city = serializers.CharField(max_length=100)
	state = serializers.CharField(max_length=100, required=False, allow_blank=True)
	postal_code = serializers.CharField(max_length=20)
	country = serializers.CharField(max_length=100)
	phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
	recipient_name = serializers.CharField(max_length=150)
	is_default = serializers.BooleanField(required=False, default=False)
	created_at = serializers.DateTimeField(read_only=True)

	def validate_postal_code(self, value):
		if not value or len(value.strip()) < 2:
			raise serializers.ValidationError("Postal code is required and must be at least 2 characters.")
		return value.strip()

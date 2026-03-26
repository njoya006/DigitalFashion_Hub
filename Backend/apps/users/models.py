import uuid
from django.db import models


class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=20, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "roles"

    def __str__(self):
        return self.role_name


class User(models.Model):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(max_length=255, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.ForeignKey(Role, on_delete=models.RESTRICT, db_column="role_id", null=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, null=True, blank=True)
    avatar_url = models.TextField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        managed = False
        db_table = "users"

    def __str__(self):
        return self.email

    @property
    def id(self):
        return self.user_id

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def check_password(self, raw_password):
        from apps.users.utils import check_password

        return check_password(raw_password, self.password_hash)


class CustomerTier(models.Model):
    tier_id = models.AutoField(primary_key=True)
    tier_name = models.CharField(max_length=20)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    min_lifetime_value = models.DecimalField(max_digits=12, decimal_places=2)
    perks = models.TextField(null=True, blank=True)
    badge_color = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        managed = False
        db_table = "customer_tiers"

    def __str__(self):
        return self.tier_name


class Customer(models.Model):
    user = models.OneToOneField(
        User,
        primary_key=True,
        on_delete=models.CASCADE,
        db_column="customer_id",
        related_name="customer_profile",
        to_field="user_id",
    )
    tier = models.ForeignKey(CustomerTier, on_delete=models.SET_NULL, null=True, db_column="tier_id")
    preferred_currency = models.CharField(max_length=3, null=True, blank=True)
    loyalty_points = models.IntegerField(default=0)
    lifetime_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    date_of_birth = models.DateField(null=True, blank=True)
    registered_date = models.DateField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = "customers"

    @property
    def customer_id(self):
        return self.user_id


class Seller(models.Model):
    user = models.OneToOneField(
        User,
        primary_key=True,
        on_delete=models.CASCADE,
        db_column="seller_id",
        related_name="seller_profile",
        to_field="user_id",
    )
    store_name = models.CharField(max_length=150, unique=True)
    store_logo_url = models.TextField(null=True, blank=True)
    store_description = models.TextField(null=True, blank=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    is_approved = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_sales = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        managed = False
        db_table = "sellers"

    def __str__(self):
        return self.store_name

    @property
    def seller_id(self):
        return self.user_id

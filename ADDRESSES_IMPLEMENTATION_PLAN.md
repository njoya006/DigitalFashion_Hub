# Addresses API Implementation Plan

## Overview
Create a complete address management system so users can manage shipping addresses instead of manually entering IDs.

---

## Step 1: Create Backend Addresses App

### 1a. Create Models (`Backend/apps/addresses/models.py`)

```python
from django.db import models
import uuid

class Address(models.Model):
    address_id = models.AutoField(primary_key=True)
    user_id = models.UUIDField()  # Foreign key to users table
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    recipient_name = models.CharField(max_length=150)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'addresses'
        managed = False  # Since we're using raw SQL schema
```

### 1b. Create Serializer (`Backend/apps/addresses/serializers.py`)

```python
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
```

### 1c. Create Views (`Backend/apps/addresses/views.py`)

```python
from django.db import connection
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from .serializers import AddressSerializer

class AddressListView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="List user addresses", tags=["Addresses"])
    def get(self, request):
        """Get all addresses for current user"""
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT address_id, street, city, state, postal_code, country, phone, recipient_name, is_default, created_at FROM addresses WHERE user_id = %s ORDER BY is_default DESC, created_at DESC",
                [str(request.user.user_id)]
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
                """INSERT INTO addresses 
                (user_id, street, city, state, postal_code, country, phone, recipient_name, is_default)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING address_id, street, city, state, postal_code, country, phone, recipient_name, is_default, created_at""",
                [
                    str(request.user.user_id),
                    payload['street'],
                    payload['city'],
                    payload.get('state', ''),
                    payload['postal_code'],
                    payload['country'],
                    payload.get('phone', ''),
                    payload['recipient_name'],
                    payload.get('is_default', False)
                ]
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
            cursor.execute(
                "SELECT user_id FROM addresses WHERE address_id = %s",
                [address_id]
            )
            row = cursor.fetchone()
            if not row or str(row[0]) != str(request.user.user_id):
                return Response(
                    {"success": False, "error": "Access denied"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update
            cursor.execute(
                """UPDATE addresses 
                SET street=%s, city=%s, state=%s, postal_code=%s, country=%s, phone=%s, recipient_name=%s, is_default=%s
                WHERE address_id=%s
                RETURNING address_id, street, city, state, postal_code, country, phone, recipient_name, is_default, created_at""",
                [
                    payload.get('street'),
                    payload.get('city'),
                    payload.get('state'),
                    payload.get('postal_code'),
                    payload.get('country'),
                    payload.get('phone'),
                    payload.get('recipient_name'),
                    payload.get('is_default', False),
                    address_id
                ]
            )
            row = cursor.fetchone()
            columns = [col[0] for col in cursor.description]
            address = dict(zip(columns, row))
        
        return Response({"success": True, "data": address}, status=status.HTTP_200_OK)
    
    @extend_schema(summary="Delete address", tags=["Addresses"])
    def delete(self, request, address_id):
        """Delete address (owner only)"""
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT user_id FROM addresses WHERE address_id = %s",
                [address_id]
            )
            row = cursor.fetchone()
            if not row or str(row[0]) != str(request.user.user_id):
                return Response(
                    {"success": False, "error": "Access denied"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            cursor.execute("DELETE FROM addresses WHERE address_id = %s", [address_id])
        
        return Response({"success": True, "message": "Address deleted"}, status=status.HTTP_200_OK)
```

### 1d. Create URLs (`Backend/apps/addresses/urls.py`)

```python
from django.urls import path
from .views import AddressListView, AddressDetailView

urlpatterns = [
    path("", AddressListView.as_view(), name="addresses-list"),
    path("<int:address_id>/", AddressDetailView.as_view(), name="addresses-detail"),
]
```

### 1e. Add to Main Config (`Backend/config/urls.py`)

Add this line to `urlpatterns`:
```python
path("api/v1/addresses/", include("apps.addresses.urls")),
```

### 1f. Create Database Schema

Add to `Backend/database/schema/001_create_tables.sql`:

```sql
CREATE TABLE IF NOT EXISTS Addresses (
    address_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    recipient_name VARCHAR(150) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user_id ON Addresses(user_id);
```

---

## Step 2: Update Frontend Storefront API

### Update `Frontend/lib/storefront.ts`

Add these interfaces and functions:

```typescript
export interface Address {
  address_id: number
  street: string
  city: string
  state?: string
  postal_code: string
  country: string
  phone?: string
  recipient_name: string
  is_default: boolean
  created_at: string
}

export async function fetchAddresses(): Promise<Address[]> {
  const response = await api.get<{ success: boolean; data: Address[] }>('/addresses/')
  return response.data
}

export async function createAddress(address: Omit<Address, 'address_id' | 'created_at'>): Promise<Address> {
  const response = await api.post<{ success: boolean; data: Address }>('/addresses/', address)
  return response.data
}

export async function updateAddress(addressId: number, address: Partial<Address>): Promise<Address> {
  const response = await api.put<{ success: boolean; data: Address }>(`/addresses/${addressId}/`, address)
  return response.data
}

export async function deleteAddress(addressId: number): Promise<void> {
  await api.del(`/addresses/${addressId}/`)
}
```

---

## Step 3: Create Frontend Pages

### Create `Frontend/app/customer/addresses/page.tsx`

This page will let users manage their addresses. Use:
- Form to add/edit addresses
- List of saved addresses with edit/delete buttons
- Mark default address
- Show full address details in a card format

### Update `Frontend/app/checkout/page.tsx`

Replace the text input with:
- Dropdown showing user's saved addresses
- "Add New Address" button or link
- Form to quickly add address inline
- Pre-fill default address on page load

---

## Step 4: Testing

1. **Backend Test in Swagger**:
   - `POST /api/v1/addresses/` - Create address
   - `GET /api/v1/addresses/` - List addresses
   - `PUT /api/v1/addresses/{id}/` - Update address
   - `DELETE /api/v1/addresses/{id}/` - Delete address

2. **Frontend Flow Test**:
   - Create an address via customer dashboard
   - Go to checkout
   - Verify address dropdown shows your created address
   - Select it and place order successfully

---

## Time Estimate

- Backend setup + implementation: **1.5 hours**
- Frontend address management page: **2 hours**
- Checkout integration: **1 hour**
- Testing: **0.5 hour**

**Total: ~5 hours**

---

## Benefits

✅ Users can save multiple addresses  
✅ Checkout is now user-friendly (no manual ID entry)  
✅ Set default address for quick checkout  
✅ Full CRUD operations on addresses  
✅ Address is properly linked to user (security)

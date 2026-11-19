
from django.db import transaction
from rest_framework import serializers

from .models import Order, OrderItem, WaiterNotification


class OrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderItemCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderItem
        fields = ['item_name', 'quantity', 'unit_price']


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemCreateSerializer(
        many=True,
        required=False
    )

    estimated_ready_at = serializers.SerializerMethodField()

    queue_position = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    @transaction.atomic
    def create(self, validated_data):

        items_data = validated_data.pop('items', [])

        order = Order.objects.create(**validated_data)

        for item in items_data:
            OrderItem.objects.create(
                order=order,
                **item
            )

        return order

    def get_estimated_ready_at(self, obj):

        if obj.status != 'preparing' or not obj.started_at:
            return None

        from datetime import timedelta

        return (
            obj.started_at +
            timedelta(minutes=obj.estimated_preparation_time)
        )

    def get_queue_position(self, obj):

        if obj.status != 'pending':
            return None

        from .views import priority_order

        orders = priority_order(
            Order.objects.filter(status='pending')
        )

        for position, order in enumerate(orders, start=1):
            if order.id == obj.id:
                return position

        return None


class WaiterNotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = WaiterNotification
        fields = '__all__'


from django.db.models import Case, When, Value, IntegerField
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem, WaiterNotification

from .serializers import (
    OrderSerializer,
    OrderItemSerializer,
    WaiterNotificationSerializer
)


# Priority ordering helper
def priority_order(queryset):
    return queryset.order_by(
        Case(
            When(priority='urgent', then=Value(1)),
            When(priority='high', then=Value(2)),
            default=Value(3),
            output_field=IntegerField()
        ),
        'created_at'
    )


# Order Management
class OrderViewSet(viewsets.ModelViewSet):
    

    queryset = Order.objects.all().prefetch_related('items')
    serializer_class = OrderSerializer

    def get_queryset(self):

        queryset = super().get_queryset()

        order_status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')

        if order_status:
            queryset = queryset.filter(status=order_status)

        if priority:
            queryset = queryset.filter(priority=priority)

        return priority_order(queryset)

    @action(detail=True, methods=["patch"], url_path="update_priority")
    def update_priority(self, request, pk=None):
        order = self.get_object()

        priority = request.data.get("priority")

        allowed_priorities = ["normal", "high", "urgent"]

        if priority not in allowed_priorities:
            return Response(
                {"error": "Invalid priority"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.priority = priority
        order.save(update_fields=["priority"])

        return Response({
            "message": "Priority updated successfully",
            "order_id": order.id,
            "order_number": order.order_number,
            "priority": order.priority
        })


    # Update cooking status
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):

        order = self.get_object()

        new_status = request.data.get('status')

        valid_statuses = [
            'pending',
            'preparing',
            'ready',
            'served',
            'cancelled'
        ]

        if new_status not in valid_statuses:
            return Response(
                {'error': 'Invalid order status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        previous_status = order.status

        order.status = new_status

        if new_status == 'preparing' and not order.started_at:
            order.started_at = timezone.now()

        if new_status == 'ready' and previous_status != 'ready':
            order.ready_at = timezone.now()

            WaiterNotification.objects.create(
                order=order,
                message=f'Order {order.order_number} is ready!'
            )

        order.save()

        return Response(OrderSerializer(order).data)

    # Update order priority
    @action(detail=True, methods=['patch'])
    def update_priority(self, request, pk=None):

        order = self.get_object()

        new_priority = request.data.get('priority')

        valid_priorities = ['normal', 'high', 'urgent']

        if new_priority not in valid_priorities:
            return Response(
                {'error': 'Invalid priority'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.priority = new_priority
        order.save()

        return Response(OrderSerializer(order).data)


# Order Item Management
class OrderItemViewSet(viewsets.ModelViewSet):

    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer


# Kitchen Dashboard
class KitchenDashboardView(APIView):

    def get(self, request):

        orders = Order.objects.all()

        data = {
            'total_orders': orders.count(),

            'pending_orders': orders.filter(
                status='pending'
            ).count(),

            'preparing_orders': orders.filter(
                status='preparing'
            ).count(),

            'ready_orders': orders.filter(
                status='ready'
            ).count(),

            'served_orders': orders.filter(
                status='served'
            ).count(),

            'urgent_orders': orders.filter(
                priority='urgent'
            ).exclude(
                status__in=['served', 'cancelled']
            ).count(),
        }

        return Response(data)


# Queue Management
class QueueManagementView(APIView):

    def get(self, request):

        orders = Order.objects.filter(
            status='pending'
        )

        orders = priority_order(orders)

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response(serializer.data)


# Waiter Notifications
class WaiterNotificationViewSet(viewsets.ModelViewSet):

    queryset = WaiterNotification.objects.all()
    serializer_class = WaiterNotificationSerializer

    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):

        queryset = super().get_queryset()

        unread = self.request.query_params.get('unread')

        if unread == 'true':
            queryset = queryset.filter(is_read=False)

        return queryset.order_by('-created_at')

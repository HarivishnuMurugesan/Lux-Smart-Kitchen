
from django.contrib import admin
from .models import Order, OrderItem, WaiterNotification


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        'order_number',
        'customer_name',
        'table_number',
        'priority',
        'status',
        'created_at'
    )

    list_filter = ('status', 'priority')

    search_fields = (
        'order_number',
        'customer_name'
    )

    inlines = [OrderItemInline]


admin.site.register(WaiterNotification)


from django.db import models


class Order(models.Model):

    PRIORITY_CHOICES = [
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
        ('cancelled', 'Cancelled'),
    ]

    order_number = models.CharField(
        max_length=20,
        unique=True
    )

    customer_name = models.CharField(max_length=100)

    table_number = models.PositiveIntegerField()

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    estimated_preparation_time = models.PositiveIntegerField(
        default=15
    )

    created_at = models.DateTimeField(auto_now_add=True)

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    ready_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.order_number



class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )

    item_name = models.CharField(max_length=100)

    quantity = models.PositiveIntegerField(default=1)

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return self.item_name

    item_name = models.CharField(max_length=100)

    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.item_name


class WaiterNotification(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    message = models.CharField(max_length=255)

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message

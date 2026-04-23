from django.db import models
from django.conf import settings
import uuid


def generate_slug(title):
    import re
    slug_base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    short_id = uuid.uuid4().hex[:6]
    return f"{slug_base}-{short_id}"


class Zine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='zines'
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    is_public = models.BooleanField(default=False)

    # Cover image for shelf display
    cover_image_url = models.URLField(blank=True, default='')

    # Zine theme color (hex)
    theme_color = models.CharField(max_length=7, default='#F3B0C3')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_slug(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} by {self.owner.username}"


class ZineCell(models.Model):
    """One of the 8 cells in the zine grid."""
    CELL_LABELS = [
        ('cover', 'Cover'),
        ('back', 'Back'),
        ('page1', 'Page 1'),
        ('page2', 'Page 2'),
        ('page3', 'Page 3'),
        ('page4', 'Page 4'),
        ('page5', 'Page 5'),
        ('page6', 'Page 6'),
    ]

    zine = models.ForeignKey(Zine, on_delete=models.CASCADE, related_name='cells')
    cell_key = models.CharField(max_length=10, choices=CELL_LABELS)

    # Cloudinary
    image_url = models.URLField(blank=True, default='')
    cloudinary_public_id = models.CharField(max_length=255, blank=True, default='')

    # Text content
    text_content = models.TextField(blank=True, default='')
    text_color = models.CharField(max_length=7, default='#1a1a1a')
    font_size = models.IntegerField(default=16)

    # Background
    bg_color = models.CharField(max_length=7, default='#FFFFFF')

    class Meta:
        unique_together = ('zine', 'cell_key')
        ordering = ['cell_key']

    def __str__(self):
        return f"{self.zine.title} - {self.cell_key}"

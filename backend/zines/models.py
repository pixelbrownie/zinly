from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import uuid

class Zine(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='zines')
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    is_public = models.BooleanField(default=False)
    
    # 8 pages
    page1 = models.ImageField(upload_to='zines/pages/', null=True, blank=True)
    page2 = models.ImageField(upload_to='zines/pages/', null=True, blank=True)
    page3 = models.ImageField(upload_to='zines/pages/', null=True, blank=True)
    page4 = models.ImageField(upload_to='zines/pages/', null=True, blank=True)
    page5 = models.ImageField(upload_to='zines/pages/', null=True, blank=True)
    page6 = models.ImageField(upload_to='zines/pages/', null=True, blank=True)
    page_back = models.ImageField(upload_to='zines/pages/', null=True, blank=True)
    page_cover = models.ImageField(upload_to='zines/pages/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            # Generate slug from title + first 8 chars of uuid
            short_id = str(uuid.uuid4())[:8]
            self.slug = f"{slugify(self.title)}-{short_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
